<?php

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/** The migration has already run under RefreshDatabase, so re-run it by hand. */
function runPlaceholderCleanup(): void
{
    $migration = require database_path('migrations/2026_09_10_141500_remove_placeholder_catalog_products.php');
    $migration->up();
}

function makePlaceholder(string $slug, string $sku, string $name): Product
{
    return Product::create([
        'name' => $name,
        'slug' => $slug,
        'sku' => $sku,
        'price_cents' => 12600,
        'currency' => 'ZAR',
        'is_active' => true,
    ]);
}

it('removes the two early admin test rows', function () {
    makePlaceholder('black-shirt', 'TS-BLACK-S', 'Boxy Tee - Midnight');
    makePlaceholder('rwrfdfdf', 'dfsdfdsfsd', 'Heavy Hoodie - Shadow');

    runPlaceholderCleanup();

    expect(Product::whereIn('slug', ['black-shirt', 'rwrfdfdf'])->count())->toBe(0);
});

it('leaves a real product that happens to reuse one of the slugs', function () {
    // Matched on slug *and* SKU, so a genuine product is not collateral.
    $keeper = makePlaceholder('black-shirt', 'DQ-TEE-99', 'Black Shirt');

    runPlaceholderCleanup();

    expect(Product::find($keeper->id))->not->toBeNull();
});

it('is a no-op when the rows are already gone', function () {
    $before = Product::count();

    runPlaceholderCleanup();
    runPlaceholderCleanup();

    expect(Product::count())->toBe($before);
});

it('keeps the order line readable after the product goes', function () {
    $product = makePlaceholder('rwrfdfdf', 'dfsdfdsfsd', 'Heavy Hoodie - Shadow');

    $orderId = DB::table('orders')->insertGetId([
        'order_number' => 'DQ-TEST-1',
        'status' => 'pending',
        'subtotal_cents' => 1236,
        'total_cents' => 1236,
        'currency' => 'ZAR',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('order_items')->insert([
        'order_id' => $orderId,
        'product_id' => $product->id,
        'name' => 'Heavy Hoodie - Shadow',
        'quantity' => 4,
        'unit_price_cents' => 309,
        'total_cents' => 1236,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runPlaceholderCleanup();

    $line = DB::table('order_items')->where('order_id', $orderId)->first();

    // The line survives with its own snapshot of what was bought; only the
    // pointer back to the catalogue is cleared.
    expect($line)->not->toBeNull()
        ->and($line->product_id)->toBeNull()
        ->and($line->name)->toBe('Heavy Hoodie - Shadow')
        ->and($line->quantity)->toBe(4)
        ->and($line->unit_price_cents)->toBe(309);
});
