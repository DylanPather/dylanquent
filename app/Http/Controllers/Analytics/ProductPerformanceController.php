<?php

namespace App\Http\Controllers\Analytics;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->query('period', 'last_30');

        $products = collect([
            ['id' => 1, 'name' => 'Classic T-Shirt', 'sku' => 'TS-001', 'sold' => 245, 'revenue' => 12250, 'conversion' => '3.2%', 'views' => 7656],
            ['id' => 2, 'name' => 'Hoodie Blue', 'sku' => 'HD-002', 'sold' => 189, 'revenue' => 13545, 'conversion' => '2.8%', 'views' => 6750],
            ['id' => 3, 'name' => 'Limited Edition Anime TCG', 'sku' => 'TCG-001', 'sold' => 45, 'revenue' => 9000, 'conversion' => '5.1%', 'views' => 882],
            ['id' => 4, 'name' => 'Figurine Set', 'sku' => 'FIG-001', 'sold' => 78, 'revenue' => 11700, 'conversion' => '4.2%', 'views' => 1857],
        ]);

        return Inertia::render('analytics/product-performance/index', [
            'products' => $products,
            'period' => $period,
            'stats' => [
                'total_products' => $products->count(),
                'total_sold' => (int)$products->sum('sold'),
                'total_revenue' => (int)$products->sum('revenue'),
                'avg_conversion' => '3.8%',
            ],
        ]);
    }

    public function show($productId)
    {
        $product = collect([
            'id' => $productId,
            'name' => 'Classic T-Shirt',
            'sku' => 'TS-001',
            'sold' => 245,
            'revenue' => 12250,
            'conversion' => '3.2%',
            'views' => 7656,
            'rating' => 4.6,
            'reviews' => 34,
            'inventory' => 156,
            'variants' => [
                ['name' => 'Small', 'sold' => 45, 'revenue' => 2250],
                ['name' => 'Medium', 'sold' => 120, 'revenue' => 6000],
                ['name' => 'Large', 'sold' => 80, 'revenue' => 4000],
            ],
            'daily_sales' => [45, 52, 38, 61, 55, 72, 68, 69, 71, 78, 85, 92],
        ]);

        return Inertia::render('analytics/product-performance/show', [
            'product' => $product,
        ]);
    }
}
