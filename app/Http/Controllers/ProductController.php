<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Product::query();

        // Search by name, SKU, or slug
        if ($request->has('search') && $request->search) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                    ->orWhere('sku', 'like', $search)
                    ->orWhere('slug', 'like', $search);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by stock level
        if ($request->has('stock_status') && $request->stock_status) {
            match ($request->stock_status) {
                'in_stock' => $query->where('stock_quantity', '>', 0),
                'low_stock' => $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                    ->where('low_stock_threshold', '>', 0),
                'out_of_stock' => $query->where('stock_quantity', '=', 0),
                default => null,
            };
        }

        // Sorting
        $sort = $request->get('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $sortField = ltrim($sort, '-');
        $query->orderBy($sortField, $direction);

        $products = $query
            ->paginate(15)
            ->through(function (Product $p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'slug' => $p->slug,
                    'price_cents' => $p->price_cents,
                    'currency' => $p->currency,
                    'stock_quantity' => $p->stock_quantity,
                    'low_stock_threshold' => $p->low_stock_threshold,
                    'is_active' => $p->is_active,
                    'created_at' => $p->created_at?->toDateTimeString(),
                ];
            });

        // Calculate stats
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $lowStockProducts = Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('low_stock_threshold', '>', 0)->count();
        $outOfStockProducts = Product::where('stock_quantity', 0)->count();
        $totalStock = Product::sum('stock_quantity');

        $categories = \App\Models\Category::all(['id', 'name']);

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'stats' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'low_stock' => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
                'total_stock' => $totalStock,
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'stock_status' => $request->get('stock_status', ''),
                'sort' => $request->get('sort', '-created_at'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('products/create', [
            'images' => [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'track_inventory' => ['boolean'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product = Product::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'sku' => $data['sku'],
            'description' => $data['description'] ?? null,
            'price_cents' => (int) round($data['price'] * 100),
            'compare_at_price_cents' => isset($data['compare_at_price']) ? (int) round($data['compare_at_price'] * 100) : null,
            'currency' => strtoupper($data['currency']),
            'track_inventory' => (bool) ($data['track_inventory'] ?? true),
            'stock_quantity' => (int) $data['stock_quantity'],
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return redirect()->route('products.edit', $product)->with('status', 'Product created');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $product = Product::with([
            'variants:id,product_id,name,sku,price_cents,stock_quantity,is_active',
            'images:id,product_id,url,sort_order,is_primary'
        ])->findOrFail($id);

        return Inertia::render('products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'description' => $product->description,
                'price' => $product->price_cents / 100,
                'compare_at_price' => $product->compare_at_price_cents ? $product->compare_at_price_cents / 100 : null,
                'currency' => $product->currency,
                'track_inventory' => $product->track_inventory,
                'stock_quantity' => $product->stock_quantity,
                'low_stock_threshold' => $product->low_stock_threshold,
                'is_active' => $product->is_active,
            ],
            'variants' => $product->variants->map(function ($v) {
                return [
                    'id' => $v->id,
                    'name' => $v->name,
                    'sku' => $v->sku,
                    'price' => $v->price_cents ? $v->price_cents / 100 : null,
                    'stock_quantity' => $v->stock_quantity,
                    'is_active' => (bool) $v->is_active,
                ];
            }),
            'images' => $product->images->map(function ($img) {
                return [
                    'id' => $img->id,
                    'url' => '/storage/' . $img->url,
                    'sort_order' => $img->sort_order,
                    'is_primary' => $img->is_primary,
                ];
            }),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'sku' => ['required', 'string', 'max:255', 'unique:products,sku,' . $product->id],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'track_inventory' => ['boolean'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product->update([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'sku' => $data['sku'],
            'description' => $data['description'] ?? null,
            'price_cents' => (int) round($data['price'] * 100),
            'compare_at_price_cents' => isset($data['compare_at_price']) ? (int) round($data['compare_at_price'] * 100) : null,
            'currency' => strtoupper($data['currency']),
            'track_inventory' => (bool) ($data['track_inventory'] ?? true),
            'stock_quantity' => (int) $data['stock_quantity'],
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);

        return back()->with('status', 'Product updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return redirect()->route('products.index')->with('status', 'Product deleted');
    }
}
