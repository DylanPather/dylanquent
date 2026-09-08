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
        $outerwear = \App\Models\Category::firstOrCreate(['slug' => 'outerwear'], ['name' => 'Outerwear']);
        $tops = \App\Models\Category::firstOrCreate(['slug' => 'tops'], ['name' => 'Tops']);
        \App\Models\Category::firstOrCreate(['slug' => 'hoodies'], ['name' => 'Hoodies', 'parent_id' => $outerwear->id]);
        \App\Models\Category::firstOrCreate(['slug' => 't-shirts'], ['name' => 'T-Shirts', 'parent_id' => $tops->id]);

        // Collections
        $summer = \App\Models\Collection::firstOrCreate(['slug' => 'summer-2026'], ['name' => 'Summer 2026', 'description' => 'Lightweight essentials for the heat.']);
        \App\Models\Collection::firstOrCreate(['slug' => 'archive'], ['name' => 'Archive', 'description' => 'Historical pieces.']);

        // Attributes
        \App\Models\ProductAttribute::firstOrCreate(['name' => 'Size'], ['type' => 'select', 'values' => ['XS', 'S', 'M', 'L', 'XL', 'XXL']]);
        \App\Models\ProductAttribute::firstOrCreate(['name' => 'Material'], ['type' => 'text']);
        \App\Models\ProductAttribute::firstOrCreate(['name' => 'Color'], ['type' => 'select', 'values' => ['Black', 'White', 'Grey', 'Olive']]);

        // Products integration
        $reviewer = \App\Models\User::orderBy('id')->first();

        foreach (\App\Models\Product::all() as $product) {
            // attach() would duplicate pivot rows on every run.
            $product->categories()->syncWithoutDetaching([$tops->id]);
            $product->collections()->syncWithoutDetaching([$summer->id]);

            if (! $reviewer || $product->reviews()->exists()) {
                continue;
            }

            foreach ([5, 4, 5] as $rating) {
                \App\Models\Review::create([
                    'product_id' => $product->id,
                    'user_id' => $reviewer->id,
                    'rating' => $rating,
                    'comment' => 'Exceptional quality and fit. The minimalist design is perfect.',
                    'is_visible' => true,
                ]);
            }
        }
    }
}
