<?php

use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('reports variant inventory as stock, not the legacy column', function () {
    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE',
        'price_cents' => 4500, 'currency' => 'ZAR', 'is_active' => true,
        'stock_quantity' => 0,          // legacy column says sold out
        'low_stock_threshold' => 5,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'M', 'sku' => 'DQ-TEE-M',
        'price_cents' => 4500, 'track_inventory' => true, 'is_active' => true,
    ]);
    $warehouse = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create([
        'product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id, 'quantity' => 32,
    ]);

    $this->actingAs(User::factory()->create())
        ->get('/catalog/products')
        ->assertInertia(fn ($p) => $p
            ->where('products.data.0.stock_quantity', 32)
            ->where('stats.out_of_stock', 0)
            ->where('stats.total_stock', 32));
});

it('falls back to the column for products without variants', function () {
    Product::create([
        'name' => 'Sticker', 'slug' => 'sticker', 'sku' => 'DQ-STK',
        'price_cents' => 1000, 'currency' => 'ZAR', 'is_active' => true,
        'stock_quantity' => 7, 'low_stock_threshold' => 0,
    ]);

    $this->actingAs(User::factory()->create())
        ->get('/catalog/products')
        ->assertInertia(fn ($p) => $p->where('products.data.0.stock_quantity', 7));
});

it('filters out_of_stock using variant inventory', function () {
    $p1 = Product::create(['name' => 'A', 'slug' => 'a', 'sku' => 'A', 'price_cents' => 100, 'currency' => 'ZAR', 'is_active' => true, 'stock_quantity' => 0]);
    $v1 = ProductVariant::create(['product_id' => $p1->id, 'name' => 'S', 'sku' => 'A-S', 'price_cents' => 100, 'track_inventory' => true, 'is_active' => true]);
    $w = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create(['product_variant_id' => $v1->id, 'warehouse_id' => $w->id, 'quantity' => 4]);

    $p2 = Product::create(['name' => 'B', 'slug' => 'b', 'sku' => 'B', 'price_cents' => 100, 'currency' => 'ZAR', 'is_active' => true, 'stock_quantity' => 0]);
    $v2 = ProductVariant::create(['product_id' => $p2->id, 'name' => 'S', 'sku' => 'B-S', 'price_cents' => 100, 'track_inventory' => true, 'is_active' => true]);
    InventoryLevel::create(['product_variant_id' => $v2->id, 'warehouse_id' => $w->id, 'quantity' => 0]);

    $this->actingAs(User::factory()->create())
        ->get('/catalog/products?stock_status=out_of_stock')
        ->assertInertia(fn ($p) => $p->has('products.data', 1)->where('products.data.0.name', 'B'));
});
