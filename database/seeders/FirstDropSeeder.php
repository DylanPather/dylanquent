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
 * First Drop — a hoodie and a tee, each in five prints.
 *
 * The prints are variants rather than separate products: same blank, same
 * fit, same price, so the shopper picks a print, a colour and a size on one
 * page. Every print/colour pair carries its own photograph (Shopify-style
 * variant image) and the gallery follows the selection.
 *
 * Runs last in DatabaseSeeder because it takes ownership of these products'
 * variants and galleries from the generic storefront seeders. Re-running is
 * safe: variants are keyed on SKU and anything outside the current matrix is
 * retired, which is also how a pulled print disappears.
 */
class FirstDropSeeder extends Seeder
{
    private const COLOUR_CODES = ['Black' => 'BK', 'White' => 'WT'];

    private const IMAGES = '/images/products/first-drop';

    private function drops(): array
    {
        return [
            [
                'slug' => 'heavy-hoodie',
                'description' => '400GSM brushed-back fleece in black, cut with a boxy shoulder and a heavy '
                    .'rib hem. Five prints in the opening drop — pick yours below.',
                // One price across the drop. The big body prints cost a little
                // more to produce than a chest hit, but averaged over a run of
                // this size the difference is not worth splitting the price
                // over — set a variant's own price_cents if that changes.
                //
                // R995 against roughly R530 landed: ~R420 for a 400GSM
                // pullover blank at low volume, ~R75 average print, ~R35 label
                // and packaging. That is a ~39% gross margin before payment
                // fees, and it sits under the R1 000 barrier while still
                // clearing free delivery on its own. Sol-Sol hoodies run
                // R900–1 200 and We Are Gods R2 499, so an unknown label's
                // first drop belongs at the lower end of that range.
                'price_cents' => 99500,
                'colours' => ['Black'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                // Demo counts, deliberately uneven so in-stock, low-stock and
                // sold-out all appear without hand-editing rows. Replace with
                // real inventory before launch.
                'stock' => ['S' => 5, 'M' => 11, 'L' => 9, 'XL' => 5],
                'overrides' => [
                    ['ZG', 'Black', 'S', 3],
                    ['SW', 'Black', 'XL', 0],
                    ['MW', 'Black', 'S', 0],
                    ['QM', 'Black', 'M', 14],
                ],
                'designs' => [
                    [
                        'code' => 'QM',
                        'name' => 'Quiet Mark',
                        'blurb' => 'Small chest wordmark with the archive stamp. The whole drop in one line.',
                        'images' => ['Black' => self::IMAGES.'/hoodie-quiet-mark.webp'],
                    ],
                    [
                        'code' => 'VT',
                        'name' => 'Vertical Tokyo',
                        'blurb' => 'Katakana set vertically against an open circle, left chest.',
                        'images' => ['Black' => self::IMAGES.'/hoodie-vertical-tokyo.webp'],
                    ],
                    [
                        'code' => 'ZG',
                        'name' => 'Zen Geometry',
                        'blurb' => 'Centred brush crescent under the wordmark. The loudest of the five.',
                        'images' => ['Black' => self::IMAGES.'/hoodie-zen-geometry.webp'],
                    ],
                    [
                        'code' => 'SW',
                        'name' => 'Shadow Waifu',
                        'blurb' => 'Crescent-framed portrait with a red seal, right chest.',
                        'images' => ['Black' => self::IMAGES.'/hoodie-shadow-waifu.webp'],
                    ],
                    [
                        'code' => 'MW',
                        'name' => 'Moon Waifu',
                        'blurb' => 'Oversized tonal portrait printed black-on-black down the body.',
                        'images' => ['Black' => self::IMAGES.'/hoodie-moon-waifu.webp'],
                    ],
                ],
            ],
            [
                'slug' => 'boxy-tee',
                'description' => 'Heavyweight combed cotton, boxy through the body with a dropped shoulder '
                    .'and a ribbed collar. Five prints, in black or white.',
                // R495 against roughly R290 landed: ~R210 for a 240GSM
                // oversized blank, ~R55 print, ~R25 label and packaging. Sol-Sol
                // logo tees are R560–700, so this undercuts the established
                // local label without dropping into promo-tee territory.
                'price_cents' => 49500,
                'colours' => ['Black', 'White'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'stock' => ['S' => 7, 'M' => 14, 'L' => 12, 'XL' => 6],
                'overrides' => [
                    ['SP', 'White', 'S', 0],
                    ['QG', 'Black', 'XL', 2],
                    ['VM', 'White', 'M', 0],
                    ['MT', 'White', 'XL', 0],
                    ['SD', 'Black', 'S', 3],
                ],
                'designs' => [
                    [
                        'code' => 'SP',
                        'name' => 'Sakura Profile',
                        'blurb' => 'Side profile with blossom in the hair, right chest, under a red seal.',
                        'images' => [
                            'Black' => self::IMAGES.'/tee-sakura-profile-black.webp',
                            'White' => self::IMAGES.'/tee-sakura-profile-white.webp',
                        ],
                    ],
                    [
                        'code' => 'QG',
                        'name' => 'Quiet Gaze',
                        'blurb' => 'Cropped eyes inside a brush circle, centred over the wordmark.',
                        'images' => [
                            'Black' => self::IMAGES.'/tee-quiet-gaze-black.webp',
                            'White' => self::IMAGES.'/tee-quiet-gaze-white.webp',
                        ],
                    ],
                    [
                        'code' => 'VM',
                        'name' => 'Vertical Muse',
                        'blurb' => 'Standing figure framed beside a katakana column, right chest.',
                        'images' => [
                            'Black' => self::IMAGES.'/tee-vertical-muse-black.webp',
                            'White' => self::IMAGES.'/tee-vertical-muse-white.webp',
                        ],
                    ],
                    [
                        'code' => 'MT',
                        'name' => 'Moon Thread',
                        'blurb' => 'Crescent-backed portrait with a single red block, right chest.',
                        'images' => [
                            'Black' => self::IMAGES.'/tee-moon-thread-black.webp',
                            'White' => self::IMAGES.'/tee-moon-thread-white.webp',
                        ],
                    ],
                    [
                        'code' => 'SD',
                        'name' => 'Side Whisper',
                        'blurb' => 'Full-length figure printed tonally down the body, wordmark on the chest.',
                        'images' => [
                            'Black' => self::IMAGES.'/tee-side-whisper-black.webp',
                            'White' => self::IMAGES.'/tee-side-whisper-white.webp',
                        ],
                    ],
                ],
            ],
        ];
    }

    /** The shot that carries each product on the merch landing. */
    private function heroes(): array
    {
        return [
            'heavy-hoodie' => self::IMAGES.'/hoodie-zen-geometry.webp',
            'boxy-tee' => self::IMAGES.'/tee-side-whisper-black.webp',
        ];
    }

    public function run(): void
    {
        $drops = $this->drops();

        $collection = Collection::updateOrCreate(
            ['slug' => 'first-drop'],
            [
                'name' => 'First Drop',
                'description' => 'One hoodie, one tee, five prints each. The opening Dylanquent release.',
                'image_url' => $drops[0]['designs'][0]['images']['Black'],
                'is_active' => true,
            ]
        );

        $warehouse = Warehouse::updateOrCreate(
            ['code' => 'JHB-01'],
            ['name' => 'Johannesburg Studio', 'address' => 'Johannesburg, ZA', 'is_active' => true]
        );

        foreach ($drops as $drop) {
            $product = Product::where('slug', $drop['slug'])->first();

            if (! $product) {
                $this->command?->warn("FirstDropSeeder: {$drop['slug']} not found, skipping.");

                continue;
            }

            $product->update([
                'description' => $drop['description'],
                'price_cents' => $drop['price_cents'],
                'thumbnail_url' => $this->imagesFor($drop)[0],
            ]);

            $product->collections()->syncWithoutDetaching([$collection->id]);

            $this->replaceGallery($product, $drop);
            $this->replaceVariants($product, $drop, $warehouse);
        }

        $this->featureOnHomepage();
    }

    /** Every print/colour shot, in the order the drop lists them. */
    private function imagesFor(array $drop): array
    {
        $images = [];

        foreach ($drop['designs'] as $design) {
            foreach ($drop['colours'] as $colour) {
                $images[] = $design['images'][$colour];
            }
        }

        return $images;
    }

    /**
     * The generic inventory seeder gives every product the same three stock
     * photos; a drop needs its own, in print order.
     */
    private function replaceGallery(Product $product, array $drop): void
    {
        $keep = $this->imagesFor($drop);

        ProductImage::where('product_id', $product->id)
            ->whereNotIn('url', $keep)
            ->delete();

        foreach ($keep as $position => $url) {
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'url' => $url],
                ['is_primary' => $position === 0, 'sort_order' => $position]
            );
        }
    }

    private function replaceVariants(Product $product, array $drop, Warehouse $warehouse): void
    {
        // Plain size-only rows predate the drop and carry no print, so they
        // would show up as unlabelled extra options. Anything outside the
        // current matrix goes, which also retires a print that was pulled.
        $product->variants()
            ->whereNotIn('sku', $this->expectedSkus($product, $drop))
            ->delete();

        foreach ($drop['designs'] as $designOrder => $design) {
            foreach ($drop['colours'] as $colourOrder => $colour) {
                foreach ($drop['sizes'] as $sizeOrder => $size) {
                    $variant = ProductVariant::updateOrCreate(
                        ['sku' => $this->sku($product, $design['code'], $colour, $size)],
                        [
                            'product_id' => $product->id,
                            'name' => "{$design['name']} · {$colour} · {$size}",
                            'image_url' => $design['images'][$colour],
                            'attributes' => [
                                'design' => $design['name'],
                                'design_code' => $design['code'],
                                'design_blurb' => $design['blurb'],
                                'colour' => $colour,
                                'size' => $size,
                                // Rows keep the ids they were first written with,
                                // so renaming or reordering an option would leave
                                // the pickers in insert order. Carry the intent.
                                'design_order' => $designOrder,
                                'colour_order' => $colourOrder,
                                'size_order' => $sizeOrder,
                            ],
                            'price_cents' => $drop['price_cents'],
                            'track_inventory' => true,
                            'low_stock_threshold' => 3,
                            'is_active' => true,
                        ]
                    );

                    InventoryLevel::updateOrCreate(
                        ['product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id],
                        ['quantity' => $this->stockFor($drop, $design['code'], $colour, $size)]
                    );
                }
            }
        }
    }

    private function sku(Product $product, string $designCode, string $colour, string $size): string
    {
        $colourCode = self::COLOUR_CODES[$colour] ?? strtoupper(substr($colour, 0, 2));

        return "{$product->sku}-{$designCode}-{$colourCode}-{$size}";
    }

    private function expectedSkus(Product $product, array $drop): array
    {
        $skus = [];

        foreach ($drop['designs'] as $design) {
            foreach ($drop['colours'] as $colour) {
                foreach ($drop['sizes'] as $size) {
                    $skus[] = $this->sku($product, $design['code'], $colour, $size);
                }
            }
        }

        return $skus;
    }

    private function stockFor(array $drop, string $designCode, string $colour, string $size): int
    {
        foreach ($drop['overrides'] ?? [] as [$code, $overrideColour, $overrideSize, $quantity]) {
            if ($code === $designCode && $overrideColour === $colour && $overrideSize === $size) {
                return $quantity;
            }
        }

        return $drop['stock'][$size];
    }

    /**
     * The merch landing still pointed at the pre-drop renders. Swap those
     * cards' art; the rest of the featured edit is untouched.
     */
    private function featureOnHomepage(): void
    {
        $setting = StorefrontSetting::where('key', 'featured_products')->first();

        if (! $setting) {
            return;
        }

        $featured = json_decode($setting->value, true);

        if (! is_array($featured)) {
            return;
        }

        $heroes = $this->heroes();

        foreach ($featured as &$item) {
            $hero = $heroes[$item['slug'] ?? ''] ?? null;

            if ($hero) {
                $item['image'] = $hero;
            }
        }
        unset($item);

        $setting->update(['value' => json_encode($featured)]);
    }
}
