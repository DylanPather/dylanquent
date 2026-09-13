<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

/**
 * The two blanks the First Drop is printed on.
 *
 * DropSeeder runs after this one and takes ownership of their prints,
 * galleries and variants — the plain size-only rows written here exist so the
 * products are usable on their own if the drop seeder is skipped.
 *
 * Pricing rationale lives in DropSeeder, which is where a print run's cost is
 * written down; keep the two in step.
 */
class StorefrontProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Boxy Tee',
                'slug' => 'boxy-tee',
                'description' => 'A relaxed, heavy-weight cotton tee with a structural silhouette.',
                'price_cents' => 44900,
                'is_active' => true,
                'sku' => 'DQ-TEE-01',
                'thumbnail_url' => '/images/products/boxy_tee_black_1769346857146.png',
                'variants' => ['Small', 'Medium', 'Large', 'Extra Large']
            ],
            [
                'name' => 'Heavy Hoodie',
                'slug' => 'heavy-hoodie',
                'description' => '400GSM fleece hoodie with a minimal, sharp cut.',
                'price_cents' => 89900,
                'is_active' => true,
                'sku' => 'DQ-HD-01',
                'thumbnail_url' => '/images/products/heavy_hoodie_grey_1769346878833.png',
                'variants' => ['Small', 'Medium', 'Large']
            ]
        ];

        foreach ($products as $pData) {
            $variants = $pData['variants'];
            unset($pData['variants']);

            $product = Product::updateOrCreate(['slug' => $pData['slug']], $pData);

            foreach ($variants as $vName) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'name' => $vName],
                    ['sku' => $product->sku . '-' . strtoupper(str_replace(' ', '', $vName)), 'price_cents' => $product->price_cents]
                );
            }
        }
    }
}
