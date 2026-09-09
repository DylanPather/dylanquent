<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OrderItem;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Services\Pricing\PricingService;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index');
        }

        $customer = auth()->user()->customer;

        $subtotal = collect($cart)->sum(fn ($i) => $i['price_cents'] * $i['quantity']);

        return Inertia::render('checkout/index', [
            'cart' => $cart,
            'customer' => $customer,
            'totals' => app(PricingService::class)->forSubtotal($subtotal)->toArray(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|array',
            'billing_address' => 'required|array',
        ]);

        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index');
        }

        return DB::transaction(function () use ($request, $cart) {
            $customer = auth()->user()->customer;

            if (! $customer) {
                $customer = Customer::create([
                    'user_id' => auth()->id(),
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ]);
            }

            // Prices are re-read from the database rather than trusted from the
            // cart, which captured them whenever the item was added. A price
            // change between add-to-cart and checkout would otherwise be
            // charged at the stale amount.
            $lines = [];
            $subtotal = 0;

            foreach ($cart as $item) {
                $product = Product::find($item['product_id']);

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => "\"{$item['name']}\" is no longer available.",
                    ]);
                }

                $variant = $item['variant_id'] ? ProductVariant::with('inventoryLevels')->find($item['variant_id']) : null;

                if ($item['variant_id'] && (! $variant || $variant->product_id !== $product->id)) {
                    throw ValidationException::withMessages([
                        'cart' => "An option in your cart is no longer available.",
                    ]);
                }

                // Stock is checked again here: it was verified when the item
                // went into the cart, which may have been long ago.
                if ($variant && $variant->track_inventory) {
                    $available = (int) $variant->inventoryLevels->sum('quantity');

                    if ($available < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'cart' => "Only {$available} left of \"{$item['name']}\".",
                        ]);
                    }
                }

                $unitPrice = (int) ($variant?->price_cents ?: $product->price_cents);
                $lineTotal = $unitPrice * $item['quantity'];
                $subtotal += $lineTotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price_cents' => $unitPrice,
                    'total_cents' => $lineTotal,
                ];
            }

            $totals = app(PricingService::class)->forSubtotal($subtotal);

            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(10)),
                'customer_id' => $customer->id,
                'status' => 'pending',
                'payment_status' => 'pending',
                'subtotal_cents' => $totals->subtotalCents,
                'tax_total_cents' => $totals->taxCents,
                'shipping_total_cents' => $totals->shippingCents,
                'total_cents' => $totals->totalCents,
                'currency' => config('store.currency'),
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'placed_at' => now(),
            ]);

            foreach ($lines as $line) {
                OrderItem::create($line + ['order_id' => $order->id]);
            }

            session()->put('order_id', $order->id);

            return redirect()->route('payment.show');
        });
    }

    public function success(Request $request)
    {
        $order = Order::where('order_number', $request->order)->with('items')->firstOrFail();

        return Inertia::render('checkout/success', [
            'order' => $order
        ]);
    }
}