<?php

namespace App\Http\Controllers\Fulfillment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PickPackController extends Controller
{
    public function index(Request $request)
    {
        $orders = collect([
            ['id' => 1, 'order_number' => 'ORD-001', 'customer' => 'John Doe', 'items_count' => 3, 'status' => 'picking', 'created_at' => 'May 20, 2025'],
            ['id' => 2, 'order_number' => 'ORD-002', 'customer' => 'Jane Smith', 'items_count' => 2, 'status' => 'packed', 'created_at' => 'May 19, 2025'],
            ['id' => 3, 'order_number' => 'ORD-003', 'customer' => 'Bob Johnson', 'items_count' => 5, 'status' => 'ready_to_ship', 'created_at' => 'May 18, 2025'],
            ['id' => 4, 'order_number' => 'ORD-004', 'customer' => 'Alice Brown', 'items_count' => 1, 'status' => 'picking', 'created_at' => 'May 17, 2025'],
        ]);

        $stats = [
            'total_orders' => $orders->count(),
            'picking' => $orders->where('status', 'picking')->count(),
            'packed' => $orders->where('status', 'packed')->count(),
            'ready_to_ship' => $orders->where('status', 'ready_to_ship')->count(),
        ];

        return Inertia::render('fulfillment/pick-pack/index', [
            'sampleData' => true,
            'orders' => $orders,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, $orderId)
    {
        $order = collect([
            'id' => $orderId,
            'order_number' => 'ORD-001',
            'customer' => 'John Doe',
            'status' => 'picking',
            'items' => [
                ['id' => 1, 'name' => 'Classic T-Shirt', 'sku' => 'TS-001', 'quantity' => 2, 'picked' => false],
                ['id' => 2, 'name' => 'Hoodie Blue', 'sku' => 'HD-002', 'quantity' => 1, 'picked' => true],
            ],
            'created_at' => 'May 20, 2025',
            'shipping_address' => [
                'name' => 'John Doe',
                'street' => '123 Main St',
                'city' => 'Johannesburg',
                'country' => 'South Africa',
                'postal' => '2000',
            ]
        ]);

        return Inertia::render('fulfillment/pick-pack/show', [
            'sampleData' => true,
            'order' => $order,
        ]);
    }

    public function markAsPacked(Request $request, $orderId)
    {
        return response()->json(['message' => 'Order marked as packed']);
    }

    public function markAsReady(Request $request, $orderId)
    {
        return response()->json(['message' => 'Order marked as ready to ship']);
    }
}
