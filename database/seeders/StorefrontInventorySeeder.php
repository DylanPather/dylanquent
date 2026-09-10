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
            ['code' => 'JHB-01'],
            ['name' => 'Johannesburg Studio', 'address' => 'Johannesburg, ZA', 'is_active' => true]
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

        // Each product gets its own shot and nothing else. This seeder used to
        // pad every gallery out to three with whatever else was in public/,
        // which put a hoodie and a tee in the cap's gallery — visible now that
        // the storefront cards cycle through a product's shots.
        $stockPhotos = [
            '/images/products/boxy_tee_black_1769346857146.png',
            '/images/products/heavy_hoodie_grey_1769346878833.png',
            '/images/products/cargo_pants_olive_1769346899867.png',
            '/images/products/streetwear_cap_black_1769346921972.png',
        ];

        foreach (Product::all() as $product) {
            if (! $product->thumbnail_url) {
                continue;
            }

            // Only the photos this seeder itself injected are pruned, so a
            // gallery built in the admin is left alone.
            ProductImage::where('product_id', $product->id)
                ->whereIn('url', $stockPhotos)
                ->where('url', '!=', $product->thumbnail_url)
                ->delete();

            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'url' => $product->thumbnail_url],
                ['is_primary' => true, 'sort_order' => 0]
            );
        }
    }
}
