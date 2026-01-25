<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;

class StorefrontProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Boxy Tee',
                'slug' => 'boxy-tee',
                'description' => 'A relaxed, heavy-weight cotton tee with a structural silhouette.',
                'price_cents' => 4500,
                'is_active' => true,
                'sku' => 'DQ-TEE-01',
                'thumbnail_url' => '/images/products/boxy_tee_black_1769346857146.png',
                'variants' => ['Small', 'Medium', 'Large', 'Extra Large']
            ],
            [
                'name' => 'Heavy Hoodie',
                'slug' => 'heavy-hoodie',
                'description' => '400GSM fleece hoodie with a minimal, sharp cut.',
                'price_cents' => 8500,
                'is_active' => true,
                'sku' => 'DQ-HD-01',
                'thumbnail_url' => '/images/products/heavy_hoodie_grey_1769346878833.png',
                'variants' => ['Small', 'Medium', 'Large']
            ],
            [
                'name' => 'Cargo Trouser',
                'slug' => 'cargo-trouser',
                'description' => 'Military-inspired geometry with daily utility.',
                'price_cents' => 12000,
                'is_active' => true,
                'sku' => 'DQ-TR-01',
                'thumbnail_url' => '/images/products/cargo_pants_olive_1769346899867.png',
                'variants' => ['30', '32', '34']
            ],
            [
                'name' => 'Signature Cap',
                'slug' => 'signature-cap',
                'description' => 'A low-profile cap with the Dylanquent archive mark.',
                'price_cents' => 3500,
                'is_active' => true,
                'sku' => 'DQ-CP-01',
                'thumbnail_url' => '/images/products/streetwear_cap_black_1769346921972.png',
                'variants' => ['One Size']
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
