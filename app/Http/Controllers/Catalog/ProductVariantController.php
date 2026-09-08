<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductVariantController extends Controller
{
    public function index(): Response
    {
        $variants = ProductVariant::query()
            ->with('product:id,name,sku')
            ->latest()
            ->paginate(15)
            ->through(fn(ProductVariant $v) => [
                'id' => $v->id,
                'name' => $v->name,
                'sku' => $v->sku,
                'product' => [
                    'id' => $v->product->id,
                    'name' => $v->product->name,
                    'sku' => $v->product->sku,
                ],
                'price' => $v->price_cents ? $v->price_cents / 100 : null,
                'stock_quantity' => $v->stock_quantity,
                'is_active' => $v->is_active,
            ]);

        $products = Product::query()->orderBy('name')->get(['id', 'name', 'sku']);

        return Inertia::render('catalog/variants/index', [
            'variants' => $variants,
            'products' => $products,
        ]);
    }

    public function create(Request $request): Response
    {
        $prefillProductId = $request->integer('product_id');
        $products = Product::query()->orderBy('name')->get(['id', 'name', 'sku']);
        return Inertia::render('catalog/variants/create', [
            'products' => $products,
            'prefillProductId' => $prefillProductId,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')],
            'name' => ['nullable', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', 'unique:product_variants,sku'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'track_inventory' => ['boolean'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $variant = ProductVariant::create([
            'product_id' => $data['product_id'],
            'name' => $data['name'] ?? null,
            'sku' => $data['sku'],
            'price_cents' => isset($data['price']) ? (int) round($data['price'] * 100) : null,
            'compare_at_price_cents' => isset($data['compare_at_price']) ? (int) round($data['compare_at_price'] * 100) : null,
            'track_inventory' => (bool) ($data['track_inventory'] ?? true),
            'stock_quantity' => (int) $data['stock_quantity'],
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        $redirect = $request->input('redirect');
        if ($redirect === 'product') {
            return redirect()->route('products.edit', $variant->product_id)->with('status', 'Variant created');
        }
        return redirect()->route('catalog.variants.edit', $variant)->with('status', 'Variant created');
    }

    public function edit(ProductVariant $variant): Response
    {
        $products = Product::query()->orderBy('name')->get(['id', 'name', 'sku']);
        return Inertia::render('catalog/variants/edit', [
            'variant' => [
                'id' => $variant->id,
                'product_id' => $variant->product_id,
                'name' => $variant->name,
                'sku' => $variant->sku,
                'price' => $variant->price_cents ? $variant->price_cents / 100 : null,
                'compare_at_price' => $variant->compare_at_price_cents ? $variant->compare_at_price_cents / 100 : null,
                'track_inventory' => $variant->track_inventory,
                'stock_quantity' => $variant->stock_quantity,
                'low_stock_threshold' => $variant->low_stock_threshold,
                'is_active' => $variant->is_active,
            ],
            'products' => $products,
        ]);
    }

    public function update(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')],
            'name' => ['nullable', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', Rule::unique('product_variants', 'sku')->ignore($variant->id)],
            'price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'track_inventory' => ['boolean'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $variant->update([
            'product_id' => $data['product_id'],
            'name' => $data['name'] ?? null,
            'sku' => $data['sku'],
            'price_cents' => isset($data['price']) ? (int) round($data['price'] * 100) : null,
            'compare_at_price_cents' => isset($data['compare_at_price']) ? (int) round($data['compare_at_price'] * 100) : null,
            'track_inventory' => (bool) ($data['track_inventory'] ?? true),
            'stock_quantity' => (int) $data['stock_quantity'],
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        $redirect = $request->input('redirect');
        if ($redirect === 'product') {
            return redirect()->route('products.edit', $variant->product_id)->with('status', 'Variant updated');
        }
        return back()->with('status', 'Variant updated');
    }

    public function destroy(Request $request, ProductVariant $variant)
    {
        $productId = $variant->product_id;
        $variant->delete();
        $redirect = $request->input('redirect');
        if ($redirect === 'product') {
            return redirect()->route('products.edit', $productId)->with('status', 'Variant deleted');
        }
        return redirect()->route('catalog.variants.index')->with('status', 'Variant deleted');
    }
}

