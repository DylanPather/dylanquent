<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Categories
        $outerwear = \App\Models\Category::create(['name' => 'Outerwear', 'slug' => 'outerwear']);
        $tops = \App\Models\Category::create(['name' => 'Tops', 'slug' => 'tops']);
        \App\Models\Category::create(['name' => 'Hoodies', 'slug' => 'hoodies', 'parent_id' => $outerwear->id]);
        \App\Models\Category::create(['name' => 'T-Shirts', 'slug' => 't-shirts', 'parent_id' => $tops->id]);

        // Collections
        $summer = \App\Models\Collection::create(['name' => 'Summer 2026', 'slug' => 'summer-2026', 'description' => 'Lightweight essentials for the heat.']);
        $archive = \App\Models\Collection::create(['name' => 'Archive', 'slug' => 'archive', 'description' => 'Historical pieces.']);

        // Attributes
        \App\Models\ProductAttribute::create(['name' => 'Size', 'type' => 'select', 'values' => ['XS', 'S', 'M', 'L', 'XL', 'XXL']]);
        \App\Models\ProductAttribute::create(['name' => 'Material', 'type' => 'text']);
        \App\Models\ProductAttribute::create(['name' => 'Color', 'type' => 'select', 'values' => ['Black', 'White', 'Grey', 'Olive']]);

        // Products integration
        $products = \App\Models\Product::all();
        foreach ($products as $product) {
            $product->categories()->attach($tops->id);
            $product->collections()->attach($summer->id);

            // Reviews
            for ($i = 0; $i < 3; $i++) {
                \App\Models\Review::create([
                    'product_id' => $product->id,
                    'user_id' => 1,
                    'rating' => rand(4, 5),
                    'comment' => 'Exceptional quality and fit. The minimalist design is perfect.',
                ]);
            }
        }
    }
}
