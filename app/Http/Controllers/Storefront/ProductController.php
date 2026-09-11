<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StorefrontSetting;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function home()
    {
        $settings = StorefrontSetting::pluck('value', 'key');

        return Inertia::render('welcome', [
            'storefrontSettings' => $settings,
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
                    'thumbnail_url' => $p->images->firstWhere('is_primary', true)?->url ?? $p->thumbnail_url,
                    // The card is unreadable for a five-print drop with one shot.
                    'preview_urls' => $this->previewUrls($p),
                    'categories' => $p->categories->pluck('name'),
                    'is_available' => $p->variants->some(fn ($v) => $v->inventoryLevels->sum('quantity') > 0),
                ];
            });

        return Inertia::render('shop/index', [
            'products' => $products,
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
            'variants.images',
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
                    // The angles this variant was shot from. A print that runs
                    // across the back needs the back and the front, and which
                    // pair you get depends on the print selected.
                    'images' => $v->images
                        ->map(fn ($i) => ['url' => $i->url, 'angle' => $i->angle])
                        ->values(),
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
            'preview_urls' => $this->previewUrls($p),
        ])->values();
    }

    /**
     * The shots a card cycles through.
     *
     * One per print, not one per print/colour pair: a card has a few seconds
     * of a shopper's attention and should spend them showing the range of
     * prints, not the same three prints twice in two colours. The colourways
     * are the product page's job.
     *
     * Capped because a card is a glance, not the gallery — six shots at ~2.5
     * seconds each is already fifteen seconds to see them all.
     */
    private function previewUrls(Product $p, int $limit = 6)
    {
        $withImages = $p->variants->filter(fn ($v) => $v->image_url);

        if ($withImages->isNotEmpty()) {
            return $withImages
                // Variants with no print fall back to grouping by the photo
                // itself, which is the same thing for a single-axis product.
                ->groupBy(fn ($v) => $v->attributes['design'] ?? $v->image_url)
                ->map(fn ($group) => $group->first()->image_url)
                ->values()
                ->take($limit);
        }

        $fromGallery = $p->images
            ->sortBy([['is_primary', 'desc'], ['sort_order', 'asc']])
            ->pluck('url')
            ->filter()
            ->unique()
            ->take($limit)
            ->values();

        // Never hand back nothing: a product with neither variant shots nor a
        // gallery still has to put something on its card.
        return $fromGallery->isNotEmpty()
            ? $fromGallery
            : collect([$p->thumbnail_url])->filter()->values();
    }
}
