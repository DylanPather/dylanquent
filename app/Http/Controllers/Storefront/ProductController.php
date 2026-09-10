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
        abort_unless($product->is_active, 404);

        // NOTE: product_attributes is a global lookup table with no product_id,
        // so there is no per-product `attributes` relationship to eager-load.
        // Per-product option values live on each variant's `attributes` JSON.
        $product->load([
            'variants.inventoryLevels',
            'categories',
            'reviews' => fn ($q) => $q->where('is_visible', true)->latest()->with('user:id,name'),
            'images',
        ]);

        $images = $product->images
            ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
            ->map(fn ($i) => ['id' => $i->id, 'url' => $i->url, 'alt' => $product->name])
            ->values();

        if ($images->isEmpty() && $product->thumbnail_url) {
            $images = collect([['id' => 0, 'url' => $product->thumbnail_url, 'alt' => $product->name]]);
        }

        $variants = $product->variants
            ->where('is_active', true)
            ->map(function ($v) use ($product) {
                $stock = (int) $v->inventoryLevels->sum('quantity');

                return [
                    'id' => $v->id,
                    'name' => $v->name ?: 'Standard',
                    'sku' => $v->sku,
                    'image_url' => $v->image_url,
                    'price_cents' => $v->price_cents ?: $product->price_cents,
                    'compare_at_price_cents' => $v->compare_at_price_cents,
                    'attributes' => $v->attributes,
                    'stock' => $stock,
                    'is_available' => $v->track_inventory ? $stock > 0 : true,
                ];
            })
            ->values();

        $reviews = $product->reviews->map(fn ($r) => [
            'id' => $r->id,
            'rating' => (int) $r->rating,
            'comment' => $r->comment,
            'author' => $r->user?->name ?? 'Verified buyer',
            'created_at' => $r->created_at?->toDateString(),
        ]);

        return Inertia::render('shop/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price_cents' => $product->price_cents,
                'currency' => $product->currency ?? 'ZAR',
                'categories' => $product->categories->pluck('name'),
            ],
            'images' => $images,
            'variants' => $variants,
            'reviews' => $reviews,
            'rating' => [
                'average' => $reviews->count() ? round($reviews->avg('rating'), 1) : null,
                'count' => $reviews->count(),
            ],
            'related' => $this->relatedProducts($product),
        ]);
    }

    /**
     * Products in the same categories, falling back to the newest others.
     */
    private function relatedProducts(Product $product)
    {
        $categoryIds = $product->categories->pluck('id');

        $query = Product::query()
            ->where('is_active', true)
            ->where('id', '!=', $product->id)
            ->with(['images', 'variants.inventoryLevels']);

        if ($categoryIds->isNotEmpty()) {
            $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $categoryIds));
        }

        $related = $query->take(4)->get();

        if ($related->count() < 4) {
            $related = $related->merge(
                Product::where('is_active', true)
                    ->where('id', '!=', $product->id)
                    ->whereNotIn('id', $related->pluck('id'))
                    ->with(['images', 'variants.inventoryLevels'])
                    ->latest()
                    ->take(4 - $related->count())
                    ->get()
            );
        }

        return $related->map(fn (Product $p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price_cents' => $p->price_cents,
            'thumbnail_url' => $p->images->firstWhere('is_primary', true)?->url
                ?? $p->images->first()?->url
                ?? $p->thumbnail_url,
        ])->values();
    }
}
