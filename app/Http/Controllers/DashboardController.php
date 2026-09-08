<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'last_30');

        // Calculate date range
        $startDate = match ($period) {
            'today' => now()->startOfDay(),
            'last_7' => now()->subDays(7)->startOfDay(),
            'last_30' => now()->subDays(30)->startOfDay(),
            'mtd' => now()->startOfMonth(),
            default => now()->subDays(30)->startOfDay(),
        };

        // KPI: Revenue
        $revenue = Order::where('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->sum('total_cents') / 100;

        $previousRevenue = Order::whereBetween('created_at', [
            $startDate->copy()->subDays($startDate->diffInDays(now())),
            $startDate
        ])
            ->where('payment_status', 'paid')
            ->sum('total_cents') / 100;

        $revenueDelta = $previousRevenue > 0
            ? (($revenue - $previousRevenue) / $previousRevenue * 100)
            : 0;

        // KPI: Orders
        $orders = Order::where('created_at', '>=', $startDate)->count();
        $previousOrders = Order::whereBetween('created_at', [
            $startDate->copy()->subDays($startDate->diffInDays(now())),
            $startDate
        ])->count();
        $ordersDelta = $previousOrders > 0
            ? (($orders - $previousOrders) / $previousOrders * 100)
            : 0;

        // KPI: Customers
        $customers = Order::where('created_at', '>=', $startDate)
            ->distinct('customer_id')
            ->count('customer_id');

        $previousCustomers = Order::whereBetween('created_at', [
            $startDate->copy()->subDays($startDate->diffInDays(now())),
            $startDate
        ])
            ->distinct('customer_id')
            ->count('customer_id');

        $customersDelta = $previousCustomers > 0
            ? (($customers - $previousCustomers) / $previousCustomers * 100)
            : 0;

        // KPI: Stock
        $stock = Product::sum('stock_quantity') + ProductVariant::sum('stock_quantity');

        // Top Products
        $topProducts = Order::select('order_items.product_id', 'order_items.product_variant_id', 'products.name', 'products.sku', 'products.price_cents')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.created_at', '>=', $startDate)
            ->where('orders.payment_status', 'paid')
            ->groupBy('order_items.product_id', 'order_items.product_variant_id', 'products.id', 'products.name', 'products.sku', 'products.price_cents')
            ->selectRaw('COUNT(*) as sold')
            ->orderByDesc('sold')
            ->limit(4)
            ->get()
            ->map(function ($item) {
                return [
                    'sku' => $item->sku,
                    'name' => $item->name,
                    'category' => 'Streetwear',
                    'price' => $item->price_cents / 100,
                    'sold' => $item->sold,
                ];
            });

        // Recent Orders
        $recentOrders = Order::with(['customer', 'items'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($order) {
                $statusMap = [
                    'pending' => 'Pending',
                    'paid' => 'Paid',
                    'shipped' => 'Shipped',
                    'delivered' => 'Delivered',
                    'refunded' => 'Refunded',
                ];

                return [
                    'id' => '#' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'customer' => $order->customer?->name ?? 'Guest',
                    'items' => $order->items_count ?? 0,
                    'total' => $order->total_cents / 100,
                    'status' => $statusMap[$order->payment_status] ?? 'Unknown',
                    'date' => $order->created_at->format('d M Y'),
                ];
            });

        // Low Stock Items
        $lowStockProducts = Product::where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('low_stock_threshold', '>', 0)
            ->limit(3)
            ->get()
            ->map(function ($product) {
                return [
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'stock' => $product->stock_quantity,
                ];
            });

        $lowStockVariants = ProductVariant::where('track_inventory', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('low_stock_threshold', '>', 0)
            ->limit(3)
            ->get()
            ->map(function ($variant) {
                return [
                    'sku' => $variant->sku,
                    'name' => $variant->name,
                    'stock' => $variant->stock_quantity,
                ];
            });

        $lowStock = collect($lowStockProducts)->merge($lowStockVariants)->take(3);

        return Inertia::render('dashboard', [
            'kpis' => [
                [
                    'label' => 'Revenue (MTD)',
                    'value' => 'R' . number_format($revenue, 2),
                    'delta' => sprintf('%+.1f%%', $revenueDelta),
                    'trend' => $revenueDelta >= 0 ? 'up' : 'down',
                    'icon' => 'CreditCard',
                ],
                [
                    'label' => 'Orders',
                    'value' => number_format($orders),
                    'delta' => sprintf('%+.1f%%', $ordersDelta),
                    'trend' => $ordersDelta >= 0 ? 'up' : 'down',
                    'icon' => 'ShoppingBag',
                ],
                [
                    'label' => 'Customers',
                    'value' => number_format($customers),
                    'delta' => sprintf('%+.1f%%', $customersDelta),
                    'trend' => $customersDelta >= 0 ? 'up' : 'down',
                    'icon' => 'Users',
                ],
                [
                    'label' => 'Units in Stock',
                    'value' => number_format($stock),
                    'delta' => '+0.9%',
                    'trend' => 'up',
                    'icon' => 'Package',
                ],
            ],
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'lowStock' => $lowStock,
            'period' => $period,
        ]);
    }
}
