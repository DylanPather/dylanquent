<?php

namespace App\Http\Controllers\Analytics;

use App\Models\Order;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'last_30');

        $startDate = match ($period) {
            'today' => now()->startOfDay(),
            'last_7' => now()->subDays(7)->startOfDay(),
            'last_30' => now()->subDays(30)->startOfDay(),
            'last_90' => now()->subDays(90)->startOfDay(),
            'mtd' => now()->startOfMonth(),
            'ytd' => now()->startOfYear(),
            default => now()->subDays(30)->startOfDay(),
        };

        // Revenue metrics
        $totalRevenue = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->sum('total_cents') / 100;

        $totalOrders = Order::where('created_at', '>=', $startDate)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $totalCustomers = Order::where('created_at', '>=', $startDate)
            ->distinct('customer_id')
            ->count('customer_id');

        // Daily revenue for chart
        $dailyRevenue = Order::selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total_cents)/100 as revenue')
            ->where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'orders' => $item->orders,
                'revenue' => $item->revenue,
            ]);

        // Top products
        $topProducts = Order::selectRaw('products.name, products.sku, COUNT(*) as sold, SUM(order_items.quantity) as total_qty')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.payment_status', 'paid')
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('sold')
            ->limit(10)
            ->get();

        // Payment methods
        $paymentMethods = Order::selectRaw('payment_gateway, COUNT(*) as count, SUM(total_cents)/100 as total')
            ->where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('payment_gateway')
            ->get();

        return Inertia::render('analytics/sales', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'avg_order_value' => $avgOrderValue,
                'total_customers' => $totalCustomers,
            ],
            'dailyRevenue' => $dailyRevenue,
            'topProducts' => $topProducts,
            'paymentMethods' => $paymentMethods,
            'period' => $period,
        ]);
    }
}
