<?php

namespace Database\Seeders;

use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * Demo stock and gallery images so the storefront is testable end to end.
 *
 * Replace these counts with real inventory before launch — this seeder is
 * idempotent, so re-running it resets the demo numbers.
 */
class StorefrontInventorySeeder extends Seeder
{
    public function run(): void
    {
        $warehouse = Warehouse::updateOrCreate(
            ['code' => 'CPT-01'],
            ['name' => 'Cape Town Studio', 'address' => 'Cape Town, ZA', 'is_active' => true]
        );

        // Deliberately varied so the page's in-stock / low-stock / sold-out
        // states can all be seen without editing data by hand.
        $pattern = [12, 5, 0, 24, 3, 8];
        $i = 0;

        foreach (ProductVariant::all() as $variant) {
            InventoryLevel::updateOrCreate(
                ['product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id],
                ['quantity' => $pattern[$i++ % count($pattern)]]
            );
        }

        // Give each product a gallery from the images already in public/.
        $gallery = [
            '/images/products/boxy_tee_black_1769346857146.png',
            '/images/products/heavy_hoodie_grey_1769346878833.png',
            '/images/products/cargo_pants_olive_1769346899867.png',
            '/images/products/streetwear_cap_black_1769346921972.png',
        ];

        foreach (Product::all() as $product) {
            $primary = $product->thumbnail_url ?: $gallery[0];

            $urls = collect([$primary])
                ->merge(collect($gallery)->reject(fn ($u) => $u === $primary)->take(2))
                ->values();

            foreach ($urls as $position => $url) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'url' => $url],
                    [
                        'is_primary' => $position === 0,
                        'sort_order' => $position,
                    ]
                );
            }
        }
    }
}
