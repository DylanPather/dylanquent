<?php

namespace Database\Seeders;

use App\Models\Collection;
use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\StorefrontSetting;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * First Drop — one hoodie blank, five prints.
 *
 * The designs are variants rather than separate products: same 400GSM body,
 * same fit, same price, so the shopper picks a print and a size on one page.
 * Each design carries its own `image_url` (Shopify-style variant image) and the
 * gallery follows the selection.
 *
 * Runs last in DatabaseSeeder because it takes ownership of the hoodie's
 * variants and gallery from the generic storefront seeders.
 */
class FirstDropSeeder extends Seeder
{
    /**
     * One price for the whole drop. Every design costs the same to print at
     * this run size, so there is no per-design uplift — set `price_cents` on an
     * individual variant below if that changes.
     */
    private const PRICE_CENTS = 8500;

    private const SIZES = ['S', 'M', 'L', 'XL'];

    /**
     * Deliberately uneven so in-stock, low-stock and sold-out all appear
     * without hand-editing rows. Replace with real counts before launch.
     */
    private const STOCK = [
        'QM' => ['S' => 8,  'M' => 14, 'L' => 12, 'XL' => 6],
        'VT' => ['S' => 5,  'M' => 10, 'L' => 9,  'XL' => 4],
        'ZG' => ['S' => 3,  'M' => 11, 'L' => 7,  'XL' => 5],
        'SW' => ['S' => 2,  'M' => 9,  'L' => 8,  'XL' => 0],
        'MW' => ['S' => 0,  'M' => 7,  'L' => 6,  'XL' => 3],
    ];

    private function designs(): array
    {
        return [
            [
                'code' => 'QM',
                'name' => 'Quiet Mark',
                'blurb' => 'Small chest wordmark with the archive stamp. The whole drop in one line.',
                'image' => '/images/products/first-drop/hoodie-quiet-mark.webp',
            ],
            [
                'code' => 'VT',
                'name' => 'Vertical Tokyo',
                'blurb' => 'Katakana set vertically against an open circle, left chest.',
                'image' => '/images/products/first-drop/hoodie-vertical-tokyo.webp',
            ],
            [
                'code' => 'ZG',
                'name' => 'Zen Geometry',
                'blurb' => 'Centred brush crescent under the wordmark. The loudest of the five.',
                'image' => '/images/products/first-drop/hoodie-zen-geometry.webp',
            ],
            [
                'code' => 'SW',
                'name' => 'Shadow Waifu',
                'blurb' => 'Crescent-framed portrait with a red seal, right chest.',
                'image' => '/images/products/first-drop/hoodie-shadow-waifu.webp',
            ],
            [
                'code' => 'MW',
                'name' => 'Moon Waifu',
                'blurb' => 'Oversized tonal portrait printed black-on-black down the body.',
                'image' => '/images/products/first-drop/hoodie-moon-waifu.webp',
            ],
        ];
    }

    public function run(): void
    {
        $product = Product::where('slug', 'heavy-hoodie')->first();

        if (! $product) {
            $this->command?->warn('FirstDropSeeder: heavy-hoodie product not found, skipping.');

            return;
        }

        $designs = $this->designs();

        $collection = Collection::updateOrCreate(
            ['slug' => 'first-drop'],
            [
                'name' => 'First Drop',
                'description' => 'One hoodie. Five prints. The opening Dylanquent release.',
                'image_url' => $designs[0]['image'],
                'is_active' => true,
            ]
        );

        $product->update([
            'description' => '400GSM brushed-back fleece in black, cut with a boxy shoulder and a heavy rib hem. '
                .'Five prints in the opening drop — pick yours below.',
            'thumbnail_url' => $designs[0]['image'],
        ]);

        $product->collections()->syncWithoutDetaching([$collection->id]);

        $this->replaceGallery($product, $designs);
        $this->replaceVariants($product, $designs);
        $this->featureOnHomepage($designs);
    }

    /**
     * The merch landing still pointed at the old grey hoodie render. Swap that
     * one card's art for the drop; the rest of the featured edit is untouched.
     */
    private function featureOnHomepage(array $designs): void
    {
        $setting = StorefrontSetting::where('key', 'featured_products')->first();

        if (! $setting) {
            return;
        }

        $featured = json_decode($setting->value, true);

        if (! is_array($featured)) {
            return;
        }

        // Zen Geometry is the centred print, so it reads at hero scale.
        $hero = collect($designs)->firstWhere('code', 'ZG')['image'] ?? $designs[0]['image'];

        foreach ($featured as &$item) {
            if (($item['slug'] ?? null) === 'heavy-hoodie') {
                $item['image'] = $hero;
            }
        }
        unset($item);

        $setting->update(['value' => json_encode($featured)]);
    }

    /**
     * The generic inventory seeder gives every product the same three stock
     * photos; the drop needs its own five, in design order.
     */
    private function replaceGallery(Product $product, array $designs): void
    {
        $keep = array_column($designs, 'image');

        ProductImage::where('product_id', $product->id)
            ->whereNotIn('url', $keep)
            ->delete();

        foreach ($designs as $position => $design) {
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'url' => $design['image']],
                ['is_primary' => $position === 0, 'sort_order' => $position]
            );
        }
    }

    private function replaceVariants(Product $product, array $designs): void
    {
        $warehouse = Warehouse::updateOrCreate(
            ['code' => 'JHB-01'],
            ['name' => 'Johannesburg Studio', 'address' => 'Johannesburg, ZA', 'is_active' => true]
        );

        // The plain Small/Medium/Large rows predate the drop and carry no
        // design, so they would show up as unlabelled extra options. Anything
        // outside the current matrix goes, which also retires a pulled design.
        $product->variants()
            ->whereNotIn('sku', $this->expectedSkus($product, $designs))
            ->delete();

        foreach ($designs as $designOrder => $design) {
            foreach (self::SIZES as $sizeOrder => $size) {
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => "{$product->sku}-{$design['code']}-{$size}"],
                    [
                        'product_id' => $product->id,
                        'name' => "{$design['name']} · {$size}",
                        'image_url' => $design['image'],
                        'attributes' => [
                            'design' => $design['name'],
                            'design_code' => $design['code'],
                            'design_blurb' => $design['blurb'],
                            'size' => $size,
                            // Rows keep the ids they were first written with, so
                            // renaming or reordering a print would otherwise leave
                            // the picker in insert order. Carry the intended order.
                            'design_order' => $designOrder,
                            'size_order' => $sizeOrder,
                        ],
                        'price_cents' => self::PRICE_CENTS,
                        'track_inventory' => true,
                        'low_stock_threshold' => 3,
                        'is_active' => true,
                    ]
                );

                InventoryLevel::updateOrCreate(
                    ['product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id],
                    ['quantity' => self::STOCK[$design['code']][$size]]
                );
            }
        }
    }

    private function expectedSkus(Product $product, array $designs): array
    {
        $skus = [];

        foreach ($designs as $design) {
            foreach (self::SIZES as $size) {
                $skus[] = "{$product->sku}-{$design['code']}-{$size}";
            }
        }

        return $skus;
    }
}
