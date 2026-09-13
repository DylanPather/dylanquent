<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\StorefrontSetting;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * The releases: First Drop (a hoodie and a tee, five prints each) and the
 * Development Release (a tee printed front and back).
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
class DropSeeder extends Seeder
{
    private const COLOUR_CODES = ['Black' => 'BK', 'White' => 'WT', 'Bone' => 'BN', 'Grey' => 'GY', 'Teal' => 'TL'];

    private const IMAGES = '/images/products/first-drop';

    private const DEV = '/images/products/development-release';

    private function drops(): array
    {
        return [
            [
                'slug' => 'heavy-hoodie',
                'collection' => [
                    'slug' => 'first-drop',
                    'name' => 'First Drop',
                    'description' => 'One hoodie, one tee, five prints each. The opening Dylanquent release.',
                ],

                'description' => '400GSM brushed-back fleece in black, cut with a boxy shoulder and a heavy '
                    .'rib hem. Five prints in the opening drop — pick yours below.',
                // One price across the drop. The big body prints cost a little
                // more to produce than a chest hit, but averaged over a run of
                // this size the difference is not worth splitting the price
                // over — set a variant's own price_cents if that changes.
                //
                // Priced to undercut, not to match: cheapest figure that still
                // clears a run. Roughly R530 landed — ~R420 for a 400GSM
                // pullover blank at low volume, ~R75 print, ~R35 label and
                // packaging.
                //
                // The floor is set by the run, not the unit. Assume 85% of a
                // batch sells, ~3.5% to the payment gateway, and free delivery
                // absorbed on every hoodie order (they all clear the R800
                // threshold on their own):
                //
                //   8.5P >= 10(530) + 0.035(8.5P) + 8.5(110)  ->  P >= R760
                //
                // R899 leaves headroom over that and lands under R1 000, which
                // is where an unknown label has to be to get a first order.
                // Local hoodies run R1 300–1 600 (Butan R1 499, Unseen Grail
                // R1 300–1 500, We Are Gods R2 499), so this is ~35% under the
                // market while still making money on a run that sells 8 of 10.
                'price_cents' => 89900,
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
                'collection' => [
                    'slug' => 'first-drop',
                    'name' => 'First Drop',
                    'description' => 'One hoodie, one tee, five prints each. The opening Dylanquent release.',
                ],

                'description' => 'Heavyweight combed cotton, boxy through the body with a dropped shoulder '
                    .'and a ribbed collar. Five prints, in black or white.',
                // Roughly R290 landed: ~R210 for a 240GSM oversized blank,
                // ~R55 print, ~R25 label and packaging.
                //
                // Same run maths as the hoodie, except a lone tee does not
                // clear the R800 free-delivery threshold — call it half of tee
                // orders that do:
                //
                //   8.5P >= 10(290) + 0.035(8.5P) + 0.5(8.5)(110)  ->  P >= R411
                //
                // R449 clears that and sits ~30% under the local graphic tee
                // (Sol-Sol R700, Butan R699–799, Unseen Grail R600–700) — the
                // price that gets someone to try an unknown label once.
                'price_cents' => 44900,
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
            [
                'slug' => 'development-tee',
                'name' => 'Development Tee',
                'sku' => 'DQ-DEV-01',
                // CatalogSeeder files the products that exist when it runs;
                // one introduced here has to say where it belongs.
                'category' => 'tops',
                'collection' => [
                    'slug' => 'development-release',
                    'name' => 'Development Release',
                    'description' => 'The software division on a shirt. Five prints, front and back.',
                ],
                'description' => 'Heavyweight combed cotton, boxy through the body. Printed front and back — '
                    .'a chest mark and the statement across the shoulders.',
                // The Boxy Tee's blank plus R45 for the second print location
                // — front and back is two passes, not one — so ~R335 landed
                // and a run floor of R465. R479 cleared that by 3%, which is
                // inside the error bars on the cost estimate rather than a
                // margin; R499 is the cheapest figure that is actually a
                // cushion, and still R100+ under the local graphic tee.
                'price_cents' => 49900,
                'colours' => ['Black'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'stock' => ['S' => 6, 'M' => 13, 'L' => 11, 'XL' => 5],
                'overrides' => [
                    ['ZN', 'Black', 'XL', 2],
                    ['NF', 'Black', 'S', 0],
                    ['WA', 'Black', 'M', 3],
                ],
                'designs' => [
                    [
                        'code' => 'ZN',
                        'name' => 'Zero Noise',
                        'blurb' => 'ZERO NOISE. CLEAN CODE. across the back, the division mark on the chest.',
                        'images' => [
                            'Black' => [
                                ['angle' => 'Back', 'url' => self::DEV.'/tee-zero-noise-back.webp'],
                                ['angle' => 'Front', 'url' => self::DEV.'/tee-zero-noise-front.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'SC',
                        'name' => 'Source Code',
                        'blurb' => 'SOURCE / CODE between bracket registration marks. System 01.',
                        'images' => [
                            'Black' => [
                                ['angle' => 'Back', 'url' => self::DEV.'/tee-source-code-back.webp'],
                                ['angle' => 'Front', 'url' => self::DEV.'/tee-source-code-front.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'NF',
                        'name' => '404 Normal',
                        'blurb' => 'NORMAL // NOT FOUND under a display 404. Archive 02.',
                        'images' => [
                            'Black' => [
                                ['angle' => 'Back', 'url' => self::DEV.'/tee-404-normal-back.webp'],
                                ['angle' => 'Front', 'url' => self::DEV.'/tee-404-normal-front.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'CM',
                        'name' => 'Continuous Motion',
                        'blurb' => 'PUSH, TEST, BUILD, DEPLOY down a pipeline. System 03.',
                        'images' => [
                            'Black' => [
                                ['angle' => 'Back', 'url' => self::DEV.'/tee-continuous-motion-back.webp'],
                                ['angle' => 'Front', 'url' => self::DEV.'/tee-continuous-motion-front.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'WA',
                        'name' => 'While Alive',
                        'blurb' => 'while (alive) { create(); } inside an open loop. Prototype 04.',
                        'images' => [
                            'Black' => [
                                ['angle' => 'Back', 'url' => self::DEV.'/tee-while-alive-back.webp'],
                                ['angle' => 'Front', 'url' => self::DEV.'/tee-while-alive-front.webp'],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'development-hoodie',
                'name' => 'Development Hoodie',
                'sku' => 'DQ-DEVHD-01',
                'category' => 'hoodies',
                'collection' => [
                    'slug' => 'development-release',
                    'name' => 'Development Release',
                    'description' => 'The software division on a shirt. Five prints, front and back.',
                ],
                'description' => '400GSM brushed-back fleece, boxy through the shoulder with a heavy rib '
                    .'hem. The DQ mark on the chest, the line across the back. Each print comes in the '
                    .'one colourway it was set on.',
                // Same blank as the Heavy Hoodie plus a second print location,
                // which is R45 — front and back is two passes, not one.
                'price_cents' => 94900,
                // Every colourway in the release. A print is sold in whichever
                // of these it was set on, and says so itself below.
                'colours' => ['Black', 'Bone', 'Grey', 'Teal'],
                'sizes' => ['S', 'M', 'L', 'XL'],
                'stock' => ['S' => 6, 'M' => 12, 'L' => 10, 'XL' => 5],
                'overrides' => [
                    ['GC', 'Black', 'S', 3],
                    ['OT', 'Grey', 'XL', 0],
                    ['SI', 'Teal', 'M', 2],
                    ['TI', 'Bone', 'S', 0],
                    ['BD', 'Black', 'L', 15],
                ],
                'designs' => [
                    [
                        'code' => 'GC',
                        'name' => 'Good Code & Caffeine',
                        'blurb' => 'I don\'t need luck, I have good code and caffeine. Terminal prompt beneath.',
                        'colours' => ['Black'],
                        'images' => [
                            'Black' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-good-code-caffeine-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-good-code-caffeine-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'CR',
                        'name' => 'Commit Repeat',
                        'blurb' => 'Code. Coffee. Commit. Repeat. — closed off as a tag across the back.',
                        'colours' => ['Bone'],
                        'images' => [
                            'Bone' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-commit-repeat-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-commit-repeat-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'DT',
                        'name' => 'Debugging Today',
                        'blurb' => 'Debugging today, deploying tomorrow, dominating forever.',
                        'colours' => ['Black'],
                        'images' => [
                            'Black' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-debugging-today-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-debugging-today-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'OT',
                        'name' => 'Overthinking',
                        'blurb' => 'A progress bar stuck at 72%. The only grey in the release.',
                        'colours' => ['Grey'],
                        'images' => [
                            'Grey' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-overthinking-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-overthinking-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'SI',
                        'name' => 'Ship It',
                        'blurb' => 'Ship it. Iterate. Improve. Repeat. Set in teal under a closing tag.',
                        'colours' => ['Teal'],
                        'images' => [
                            'Teal' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-ship-it-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-ship-it-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'BD',
                        'name' => 'Built Different',
                        'blurb' => 'Built with Laravel Blade & React and lots of coffee. Both marks printed.',
                        'colours' => ['Black'],
                        'images' => [
                            'Black' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-built-different-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-built-different-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'TI',
                        'name' => 'Trust Issues',
                        'blurb' => 'My IDE and I have trust issues, over an empty terminal window.',
                        'colours' => ['Bone'],
                        'images' => [
                            'Bone' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-trust-issues-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-trust-issues-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'GH',
                        'name' => 'Good Humour',
                        'blurb' => 'Code is like humor. When you have to explain it, it\'s probably bad.',
                        'colours' => ['Black'],
                        'images' => [
                            'Black' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-good-humour-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-good-humour-back.webp'],
                            ],
                        ],
                    ],
                    [
                        'code' => 'ES',
                        'name' => 'Energy Saving Mode',
                        'blurb' => 'I\'m not lazy, I\'m in energy saving mode. Battery mark, charging.',
                        'colours' => ['Teal'],
                        'images' => [
                            'Teal' => [
                                ['angle' => 'Front', 'url' => self::DEV.'/hoodie-energy-saving-mode-front.webp'],
                                ['angle' => 'Back', 'url' => self::DEV.'/hoodie-energy-saving-mode-back.webp'],
                            ],
                        ],
                    ],
                    // Silent Hero — "I fix bugs you didn't know existed in code
                    // you don't understand", black — is shot but not listed: the
                    // front export is truncated, only the top third of the image
                    // survives, in the zip and in the source folder alike. Drop
                    // the re-exported front in beside the others as
                    // hoodie-silent-hero-front.webp and add its block here; the
                    // back (hoodie-silent-hero-back.webp) is fine.
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
            'development-tee' => self::DEV.'/tee-zero-noise-back.webp',
            'development-hoodie' => self::DEV.'/hoodie-ship-it-back.webp',
        ];
    }

    public function run(): void
    {
        $warehouse = Warehouse::updateOrCreate(
            ['code' => 'JHB-01'],
            ['name' => 'Johannesburg Studio', 'address' => 'Johannesburg, ZA', 'is_active' => true]
        );

        foreach ($this->drops() as $drop) {
            $lead = $this->leadShots($drop)[0];

            $collection = Collection::updateOrCreate(
                ['slug' => $drop['collection']['slug']],
                [
                    'name' => $drop['collection']['name'],
                    'description' => $drop['collection']['description'],
                    'image_url' => $lead,
                    'is_active' => true,
                ]
            );

            // A drop naming itself is a drop introducing a product that does
            // not exist yet; the rest attach to what the storefront seeder made.
            $product = Product::where('slug', $drop['slug'])->first();

            if (! $product && empty($drop['name'])) {
                $this->command?->warn("DropSeeder: {$drop['slug']} not found, skipping.");

                continue;
            }

            $product = Product::updateOrCreate(
                ['slug' => $drop['slug']],
                array_filter([
                    'name' => $drop['name'] ?? null,
                    'sku' => $drop['sku'] ?? null,
                    'description' => $drop['description'],
                    'price_cents' => $drop['price_cents'],
                    'thumbnail_url' => $lead,
                    'currency' => 'ZAR',
                    'is_active' => true,
                ], fn ($value) => $value !== null)
            );

            $product->collections()->syncWithoutDetaching([$collection->id]);

            if (! empty($drop['category'])) {
                $category = Category::firstOrCreate(
                    ['slug' => $drop['category']],
                    ['name' => str($drop['category'])->headline()->toString()]
                );

                $product->categories()->syncWithoutDetaching([$category->id]);
            }

            $this->replaceGallery($product, $drop);
            $this->replaceVariants($product, $drop, $warehouse);
        }

        $this->featureOnHomepage();
    }

    /**
     * The colourways a print is sold in.
     *
     * Most drops shoot every print in every colour the garment comes in, so
     * the drop's own list is the answer. A print that exists in one colourway
     * only — the Development Hoodie's are each set on a single body colour —
     * says so itself, and no empty variants are written for the rest.
     */
    private function coloursFor(array $drop, array $design): array
    {
        return $design['colours'] ?? $drop['colours'];
    }

    /**
     * A design's shots for one colourway, always as a list of angles.
     *
     * A drop that shoots one side writes a bare url; one that shoots front and
     * back writes the angles out. Normalising here keeps both readable in the
     * definitions above.
     */
    private function anglesFor(array $design, string $colour): array
    {
        $shots = $design['images'][$colour] ?? null;

        if (is_string($shots)) {
            return [['angle' => null, 'url' => $shots]];
        }

        return $shots ?? [];
    }

    /** The one shot that leads each print/colour pair, in drop order. */
    private function leadShots(array $drop): array
    {
        $shots = [];

        foreach ($drop['designs'] as $design) {
            foreach ($this->coloursFor($drop, $design) as $colour) {
                $angles = $this->anglesFor($design, $colour);

                if ($angles) {
                    $shots[] = $angles[0]['url'];
                }
            }
        }

        return $shots;
    }

    /**
     * The product-level gallery: the lead shot of each print/colour pair, in
     * print order. The generic inventory seeder otherwise gives every product
     * the same three stock photos.
     *
     * Only rows without a variant are touched — a variant's angles live in the
     * same table and belong to replaceVariants.
     */
    private function replaceGallery(Product $product, array $drop): void
    {
        $keep = $this->leadShots($drop);

        ProductImage::where('product_id', $product->id)
            ->whereNull('product_variant_id')
            ->whereNotIn('url', $keep)
            ->delete();

        foreach ($keep as $position => $url) {
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'product_variant_id' => null, 'url' => $url],
                ['is_primary' => $position === 0, 'sort_order' => $position, 'angle' => null]
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
            foreach ($this->coloursFor($drop, $design) as $colourOrder => $colour) {
                foreach ($drop['sizes'] as $sizeOrder => $size) {
                    $angles = $this->anglesFor($design, $colour);

                    $variant = ProductVariant::updateOrCreate(
                        ['sku' => $this->sku($product, $design['code'], $colour, $size)],
                        [
                            'product_id' => $product->id,
                            'name' => "{$design['name']} · {$colour} · {$size}",
                            // Denormalised lead shot: cart lines and product
                            // cards need one image without loading a gallery.
                            'image_url' => $angles[0]['url'] ?? null,
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

                    $this->replaceAngles($product, $variant, $angles);

                    InventoryLevel::updateOrCreate(
                        ['product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id],
                        ['quantity' => $this->stockFor($drop, $design['code'], $colour, $size)]
                    );
                }
            }
        }
    }

    /**
     * A variant's own angles. Written per variant rather than per print so a
     * single size can later be shot on its own without special-casing.
     */
    private function replaceAngles(Product $product, ProductVariant $variant, array $angles): void
    {
        ProductImage::where('product_variant_id', $variant->id)
            ->whereNotIn('url', array_column($angles, 'url'))
            ->delete();

        foreach ($angles as $position => $shot) {
            ProductImage::updateOrCreate(
                ['product_variant_id' => $variant->id, 'url' => $shot['url']],
                [
                    'product_id' => $product->id,
                    'angle' => $shot['angle'],
                    'is_primary' => $position === 0,
                    'sort_order' => $position,
                ]
            );
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
            foreach ($this->coloursFor($drop, $design) as $colour) {
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
