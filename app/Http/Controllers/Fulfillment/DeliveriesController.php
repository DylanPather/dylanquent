<?php

namespace App\Http\Controllers\Fulfillment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DeliveriesController extends Controller
{
    public function index(Request $request)
    {
        $deliveries = collect([
            ['id' => 1, 'order_number' => 'ORD-001', 'customer' => 'John Doe', 'carrier' => 'FedEx', 'tracking' => 'FDX123456789', 'status' => 'in_transit', 'shipped_date' => 'May 18, 2025', 'expected_delivery' => 'May 22, 2025'],
            ['id' => 2, 'order_number' => 'ORD-002', 'customer' => 'Jane Smith', 'carrier' => 'UPS', 'tracking' => 'UPS987654321', 'status' => 'delivered', 'shipped_date' => 'May 16, 2025', 'expected_delivery' => 'May 20, 2025', 'delivered_date' => 'May 20, 2025'],
            ['id' => 3, 'order_number' => 'ORD-003', 'customer' => 'Bob Johnson', 'carrier' => 'DHL', 'tracking' => 'DHL456123789', 'status' => 'in_transit', 'shipped_date' => 'May 17, 2025', 'expected_delivery' => 'May 23, 2025'],
            ['id' => 4, 'order_number' => 'ORD-004', 'customer' => 'Alice Brown', 'carrier' => 'USPS', 'tracking' => 'USPS321654987', 'status' => 'delivered', 'shipped_date' => 'May 15, 2025', 'expected_delivery' => 'May 19, 2025', 'delivered_date' => 'May 19, 2025'],
        ]);

        $stats = [
            'total_deliveries' => $deliveries->count(),
            'in_transit' => $deliveries->where('status', 'in_transit')->count(),
            'delivered' => $deliveries->where('status', 'delivered')->count(),
            'avg_days' => 4,
        ];

        return Inertia::render('fulfillment/deliveries/index', [
            'deliveries' => $deliveries,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, $deliveryId)
    {
        $delivery = collect([
            'id' => $deliveryId,
            'order_number' => 'ORD-001',
            'customer' => 'John Doe',
            'carrier' => 'FedEx',
            'tracking' => 'FDX123456789',
            'status' => 'in_transit',
            'shipped_date' => 'May 18, 2025',
            'expected_delivery' => 'May 22, 2025',
            'tracking_events' => [
                ['date' => 'May 20, 2025 10:30 AM', 'location' => 'Distribution Hub, Johannesburg', 'status' => 'In Transit'],
                ['date' => 'May 19, 2025 3:45 PM', 'location' => 'Memphis, TN', 'status' => 'Picked Up'],
                ['date' => 'May 18, 2025 2:00 PM', 'location' => 'Origin Facility', 'status' => 'Shipped'],
            ]
        ]);

        return Inertia::render('fulfillment/deliveries/show', [
            'delivery' => $delivery,
        ]);
    }
}
