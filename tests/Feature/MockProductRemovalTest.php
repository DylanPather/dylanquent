<?php

use App\Models\Product;
use App\Models\StorefrontSetting;
use Database\Seeders\StorefrontSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

function runMockRemoval(): void
{
    (require database_path('migrations/2026_09_13_100000_remove_mock_storefront_products.php'))->up();
}

/** The two placeholders as the old storefront seeder wrote them. */
function seedMockProducts(): array
{
    return collect([
        ['name' => 'Cargo Trouser', 'slug' => 'cargo-trouser', 'sku' => 'DQ-TR-01', 'price_cents' => 89_500],
        ['name' => 'Signature Cap', 'slug' => 'signature-cap', 'sku' => 'DQ-CP-01', 'price_cents' => 39_500],
    ])->map(function (array $row) {
        $id = DB::table('products')->insertGetId($row + [
            'description' => 'Placeholder.',
            'currency' => 'ZAR',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('product_variants')->insert([
            'product_id' => $id,
            'name' => 'One Size',
            'sku' => $row['sku'].'-ONESIZE',
            'price_cents' => $row['price_cents'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    })->all();
}

it('removes the products that were never real', function () {
    seedMockProducts();

    runMockRemoval();

    expect(Product::whereIn('slug', ['cargo-trouser', 'signature-cap'])->count())->toBe(0)
        ->and(DB::table('product_variants')->whereIn('sku', ['DQ-TR-01-ONESIZE', 'DQ-CP-01-ONESIZE'])->count())->toBe(0);
});

it('leaves a real product that later takes one of the slugs', function () {
    // Matched on slug *and* SKU, so a trouser the studio actually makes is safe.
    DB::table('products')->insert([
        'name' => 'Cargo Trouser',
        'slug' => 'cargo-trouser',
        'sku' => 'DQ-TR-02',
        'description' => 'A real one.',
        'price_cents' => 129_500,
        'currency' => 'ZAR',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runMockRemoval();

    expect(Product::where('sku', 'DQ-TR-02')->exists())->toBeTrue();
});

it('takes them off the homepage edit and renumbers what is left', function () {
    $this->seed(StorefrontSettingsSeeder::class);

    // The edit as it stood before the seeder was cut back.
    StorefrontSetting::where('key', 'featured_products')->update(['value' => json_encode([
        ['name' => 'Boxy Tee', 'tag' => '01', 'image' => '/a.png', 'slug' => 'boxy-tee'],
        ['name' => 'Heavy Hoodie', 'tag' => '02', 'image' => '/b.png', 'slug' => 'heavy-hoodie'],
        ['name' => 'Cargo Trouser', 'tag' => '03', 'image' => '/c.png', 'slug' => 'cargo-trouser'],
        ['name' => 'Cap / DLQ', 'tag' => '04', 'image' => '/d.png', 'slug' => 'signature-cap'],
    ])]);

    runMockRemoval();

    $featured = json_decode(StorefrontSetting::where('key', 'featured_products')->value('value'), true);

    expect(array_column($featured, 'slug'))->toBe(['boxy-tee', 'heavy-hoodie'])
        ->and(array_column($featured, 'tag'))->toBe(['01', '02']);
});

it('is a no-op the second time', function () {
    seedMockProducts();

    runMockRemoval();
    runMockRemoval();

    expect(Product::whereIn('slug', ['cargo-trouser', 'signature-cap'])->count())->toBe(0);
});
