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
                ];
            });

        return Inertia::render('inventory/stock', [
            'variants' => $variants,
        ]);
    }
}

