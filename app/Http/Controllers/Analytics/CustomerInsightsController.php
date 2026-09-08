<?php

namespace App\Http\Controllers\Analytics;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CustomerInsightsController extends Controller
{
    public function index(Request $request)
    {
        $customers = collect([
            ['id' => 1, 'name' => 'John Doe', 'email' => 'john@example.com', 'orders' => 8, 'ltv' => 2456.50, 'last_order' => 'May 18, 2025'],
            ['id' => 2, 'name' => 'Jane Smith', 'email' => 'jane@example.com', 'orders' => 5, 'ltv' => 1850.75, 'last_order' => 'May 16, 2025'],
            ['id' => 3, 'name' => 'Bob Johnson', 'email' => 'bob@example.com', 'orders' => 12, 'ltv' => 3950.00, 'last_order' => 'May 20, 2025'],
            ['id' => 4, 'name' => 'Alice Brown', 'email' => 'alice@example.com', 'orders' => 3, 'ltv' => 675.50, 'last_order' => 'May 10, 2025'],
        ]);

        return Inertia::render('analytics/customer-insights/index', [
            'customers' => $customers,
            'stats' => [
                'total_customers' => $customers->count(),
                'avg_ltv' => (int)$customers->avg('ltv'),
                'avg_orders' => round($customers->avg('orders'), 1),
                'returning_rate' => '65%',
            ],
        ]);
    }

    public function show($customerId)
    {
        $customer = collect([
            'id' => $customerId,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+27 1 234 5678',
            'orders' => 8,
            'ltv' => 2456.50,
            'avg_order_value' => 307.06,
            'first_order' => 'March 15, 2025',
            'last_order' => 'May 18, 2025',
            'orders_data' => [
                ['order_number' => 'ORD-001', 'date' => 'May 18, 2025', 'amount' => 450.00, 'status' => 'Delivered'],
                ['order_number' => 'ORD-002', 'date' => 'April 22, 2025', 'amount' => 325.50, 'status' => 'Delivered'],
                ['order_number' => 'ORD-003', 'date' => 'March 15, 2025', 'amount' => 280.00, 'status' => 'Delivered'],
            ],
        ])->all();

        return Inertia::render('analytics/customer-insights/show', [
            'customer' => $customer,
        ]);
    }
}
