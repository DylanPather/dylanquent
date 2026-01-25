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
            ->with(['variants', 'categories'])
            ->latest()
            ->paginate(12);

        return Inertia::render('shop/index', [
            'products' => $products
        ]);
    }

    public function show(Product $product)
    {
        $product->load(['variants', 'categories', 'attributes', 'reviews.user']);

        return Inertia::render('shop/show', [
            'product' => $product
        ]);
    }
}