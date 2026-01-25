<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()->latest()->paginate(15)->through(fn (Order $o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'status' => $o->status,
            'total_cents' => $o->total_cents,
            'currency' => $o->currency,
            'placed_at' => $o->placed_at?->toDateTimeString(),
        ]);

        return Inertia::render('sales/orders/index', [
            'orders' => $orders,
        ]);
    }
}

