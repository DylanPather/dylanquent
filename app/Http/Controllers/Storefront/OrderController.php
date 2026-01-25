<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $customer = auth()->user()->customer;

        if (!$customer) {
            return Inertia::render('customer/orders', [
                'orders' => []
            ]);
        }

        $orders = Order::where('customer_id', $customer->id)
            ->withCount('items')
            ->latest()
            ->get();

        return Inertia::render('customer/orders', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        // Ensure the order belongs to the authenticated user's customer
        $customer = auth()->user()->customer;

        if (!$customer || $order->customer_id !== $customer->id) {
            abort(403);
        }

        $order->load(['items.product', 'items.variant']);

        return Inertia::render('customer/order-show', [
            'order' => $order
        ]);
    }
}