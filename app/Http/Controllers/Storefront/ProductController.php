<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StorefrontSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function home()
    {
        $settings = StorefrontSetting::pluck('value', 'key');

        return Inertia::render('welcome', [
            'storefrontSettings' => $settings
        ]);
    }

    public function index()
    {
        $products = Product::where('is_active', true)
            ->with(['variants.inventoryLevels', 'categories', 'images'])
            ->latest()
            ->paginate(12)
            ->through(function (Product $p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price_cents' => $p->price_cents,
                    'currency' => $p->currency,
                    'thumbnail_url' => $p->images()->where('is_primary', true)->first()?->url ?? $p->thumbnail_url,
                    'is_available' => $p->variants->some(fn($v) => $v->inventoryLevels->sum('quantity') > 0),
                ];
            });

        return Inertia::render('shop/index', [
            'products' => $products
        ]);
    }

    public function show(Product $product)
    {
        $product->load([
            'variants.inventoryLevels',
            'categories',
            'attributes',
            'reviews.user',
            'images'
        ]);

        return Inertia::render('shop/show', [
            'product' => $product,
            'variants' => $product->variants->map(fn($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'sku' => $v->sku,
                'price_cents' => $v->price_cents,
                'attributes' => $v->attributes,
                'is_available' => $v->inventoryLevels->sum('quantity') > 0,
                'stock_quantity' => $v->inventoryLevels->sum('quantity'),
            ]),
        ]);
    }
}