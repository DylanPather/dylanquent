<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Pricing\PricingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        $subtotal = collect($cart)->sum(fn ($i) => $i['price_cents'] * $i['quantity']);

        return Inertia::render('cart/index', [
            'cart' => $cart,
            'totals' => app(PricingService::class)
                ->forSubtotal($subtotal, session('shipping_method'))
                ->toArray(),
        ]);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $product = Product::with('images')->findOrFail($data['product_id']);

        abort_unless($product->is_active, 404);

        $variant = null;
        if (! empty($data['variant_id'])) {
            $variant = ProductVariant::with('inventoryLevels')->findOrFail($data['variant_id']);

            // A variant id from another product would otherwise be accepted.
            if ($variant->product_id !== $product->id) {
                return back()->withErrors(['variant_id' => 'That option does not belong to this product.']);
            }
        }

        $cart = session()->get('cart', []);
        $cartKey = $variant ? "v_{$variant->id}" : "p_{$product->id}";
        $alreadyInCart = $cart[$cartKey]['quantity'] ?? 0;
        $requested = $alreadyInCart + $data['quantity'];

        // Stock check counts what is already sitting in the cart.
        if ($variant && $variant->track_inventory) {
            $available = (int) $variant->inventoryLevels->sum('quantity');

            if ($available < 1) {
                return back()->withErrors(['quantity' => 'That option is sold out.']);
            }

            if ($requested > $available) {
                return back()->withErrors([
                    'quantity' => $alreadyInCart > 0
                        ? "Only {$available} left, and you already have {$alreadyInCart} in your cart."
                        : "Only {$available} left in stock.",
                ]);
            }
        }

        // Variant pricing was previously dropped in favour of the base product price.
        $priceCents = $variant?->price_cents ?: $product->price_cents;

        $cart[$cartKey] = [
            'id' => $cartKey,
            'product_id' => $product->id,
            'product_slug' => $product->slug,
            'variant_id' => $variant?->id,
            'name' => $product->name.($variant && $variant->name ? " — {$variant->name}" : ''),
            'price_cents' => $priceCents,
            'quantity' => $requested,
            // The variant's own shot first, so a cart line shows the print that
            // was actually chosen rather than the product's default photo.
            'thumbnail_url' => $variant?->image_url
                ?? $product->images->firstWhere('is_primary', true)?->url
                ?? $product->images->first()?->url
                ?? $product->thumbnail_url,
        ];

        session()->put('cart', $cart);

        return back()->with('success', 'Added to your cart.');
    }

    /** Remember the delivery option the customer picked. */
    public function setShippingMethod(Request $request)
    {
        $data = $request->validate([
            'method' => ['required', 'string', Rule::in(array_keys(config('store.shipping.methods', [])))],
        ]);

        session()->put('shipping_method', $data['method']);

        return back();
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $cart = session()->get('cart', []);

        if (! isset($cart[$request->id])) {
            return back();
        }

        $line = $cart[$request->id];
        $quantity = (int) $request->quantity;

        if ($line['variant_id']) {
            $variant = ProductVariant::with('inventoryLevels')->find($line['variant_id']);

            if ($variant && $variant->track_inventory) {
                $available = (int) $variant->inventoryLevels->sum('quantity');

                if ($quantity > $available) {
                    return back()->withErrors(['quantity' => "Only {$available} left in stock."]);
                }
            }
        }

        $cart[$request->id]['quantity'] = $quantity;
        session()->put('cart', $cart);

        return back();
    }

    public function remove(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
        ]);

        $cart = session()->get('cart', []);

        if (isset($cart[$request->id])) {
            unset($cart[$request->id]);
            session()->put('cart', $cart);
        }

        return back();
    }
}
