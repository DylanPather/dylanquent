<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryLevel;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $variants = ProductVariant::query()
            ->with(['product:id,name,sku', 'inventoryLevels:product_variant_id,warehouse_id,quantity'])
            ->latest()
            ->paginate(15)
            ->through(function (ProductVariant $v) {
                $total = $v->inventoryLevels->sum('quantity');
                $isLowStock = $total <= $v->low_stock_threshold;
                return [
                    'id' => $v->id,
                    'name' => $v->name ?: $v->product->name,
                    'sku' => $v->sku,
                    'product' => [
                        'id' => $v->product->id,
                        'name' => $v->product->name,
                        'sku' => $v->product->sku,
                    ],
                    'total_quantity' => $total,
                    'low_stock_threshold' => $v->low_stock_threshold,
                    'is_low_stock' => $isLowStock,
                    'is_active' => $v->is_active,
                ];
            });

        $lowStockCount = $variants->getCollection()->filter(fn($v) => $v['is_low_stock'])->count();

        return Inertia::render('inventory/stock', [
            'variants' => $variants,
            'lowStockCount' => $lowStockCount,
        ]);
    }
}

