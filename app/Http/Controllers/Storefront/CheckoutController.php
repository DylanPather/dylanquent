<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            return redirect()->route('cart.index');
        }

        $customer = auth()->user()->customer;

        return Inertia::render('checkout/index', [
            'cart' => $cart,
            'customer' => $customer
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

            if (!$customer) {
                $customer = Customer::create([
                    'user_id' => auth()->id(),
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ]);
            }

            $subtotal = 0;
            foreach ($cart as $item) {
                $subtotal += ($item['price_cents'] * $item['quantity']);
            }

            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'customer_id' => $customer->id,
                'status' => 'pending',
                'subtotal_cents' => $subtotal,
                'total_cents' => $subtotal, // Draft: simplify tax/shipping
                'currency' => 'USD',
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address,
                'placed_at' => now(),
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['variant_id'],
                    'name' => $item['name'],
                    'quantity' => $item['quantity'],
                    'unit_price_cents' => $item['price_cents'],
                    'total_cents' => $item['price_cents'] * $item['quantity'],
                ]);
            }

            session()->forget('cart');

            return redirect()->route('checkout.success', ['order' => $order->order_number]);
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