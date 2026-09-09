<?php

namespace App\Http\Controllers\Fulfillment;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CourierRatesController extends Controller
{
    public function index(Request $request)
    {
        $couriers = collect([
            ['id' => 1, 'name' => 'FedEx', 'status' => 'active', 'base_rate' => 50, 'per_kg' => 5.50, 'estimated_delivery' => '2-3 business days'],
            ['id' => 2, 'name' => 'UPS', 'status' => 'active', 'base_rate' => 45, 'per_kg' => 4.80, 'estimated_delivery' => '2-3 business days'],
            ['id' => 3, 'name' => 'DHL', 'status' => 'active', 'base_rate' => 55, 'per_kg' => 6.20, 'estimated_delivery' => '1-2 business days'],
            ['id' => 4, 'name' => 'USPS', 'status' => 'inactive', 'base_rate' => 35, 'per_kg' => 3.50, 'estimated_delivery' => '3-5 business days'],
        ]);

        $stats = [
            'total_couriers' => $couriers->count(),
            'active' => $couriers->where('status', 'active')->count(),
            'avg_base_rate' => (int) $couriers->avg('base_rate'),
            'avg_delivery_time' => '2-3 days',
        ];

        return Inertia::render('fulfillment/couriers/index', [
            'couriers' => $couriers,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('fulfillment/couriers/create', [
            'couriers' => ['FedEx', 'UPS', 'DHL', 'USPS', 'TNT', 'Aramex'],
            'countries' => ['South Africa', 'United States', 'United Kingdom', 'Australia'],
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Courier added successfully']);
    }

    public function edit($courierId)
    {
        $courier = collect([
            'id' => $courierId,
            'name' => 'FedEx',
            'base_rate' => 50,
            'per_kg' => 5.50,
            'estimated_delivery' => '2-3 business days',
        ]);

        return Inertia::render('fulfillment/couriers/edit', [
            'courier' => $courier,
        ]);
    }

    public function update(Request $request, $courierId)
    {
        return response()->json(['message' => 'Courier updated successfully']);
    }
}
