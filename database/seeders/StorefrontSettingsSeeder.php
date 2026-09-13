<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StorefrontSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'hero_title', 'value' => 'Minimalist Streetwear', 'type' => 'text'],
            ['key' => 'hero_subtitle', 'value' => 'Built for everyday movement.', 'type' => 'text'],
            ['key' => 'hero_description', 'value' => 'Clean silhouettes. Premium fabrics. Zero noise. Dylanquent launches soon with limited-run essentials.', 'type' => 'text'],
            [
                'key' => 'ethos_features',
                'value' => json_encode([
                    ['title' => 'Cut', 'text' => 'Relaxed but refined. Tailored lines that move with you.'],
                    ['title' => 'Fabric', 'text' => 'Heavyweight cottons and technical blends for all-day wear.'],
                    ['title' => 'Design', 'text' => 'Anime nods. Never cosplay. Essential marks only.'],
                ]),
                'type' => 'json'
            ],
            [
                'key' => 'featured_products',
                'value' => json_encode([
                    // The three products that actually exist. DropSeeder swaps
                    // these images for the drop's own hero shots once the
                    // prints are in; the pre-drop renders stand in until then.
                    ['name' => 'Boxy Tee', 'tag' => '01', 'image' => '/images/products/boxy_tee_black_1769346857146.png', 'slug' => 'boxy-tee'],
                    ['name' => 'Heavy Hoodie', 'tag' => '02', 'image' => '/images/products/heavy_hoodie_grey_1769346878833.png', 'slug' => 'heavy-hoodie'],
                    ['name' => 'Development Tee', 'tag' => '03', 'image' => '/images/products/development-release/tee-zero-noise-back.webp', 'slug' => 'development-tee'],
                    ['name' => 'Development Hoodie', 'tag' => '04', 'image' => '/images/products/development-release/hoodie-ship-it-back.webp', 'slug' => 'development-hoodie'],
                ]),
                'type' => 'json'
            ],
            ['key' => 'homepage_version', 'value' => 'premium', 'type' => 'text'],
        ];

        foreach ($settings as $setting) {
            \App\Models\StorefrontSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
