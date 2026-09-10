<?php

use App\Models\Product;
use App\Services\Pricing\PricingService;
use Database\Seeders\DropSeeder;
use Database\Seeders\StorefrontProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

function runPriceMigration(): void
{
    (require database_path('migrations/2026_09_10_143000_set_launch_prices.php'))->up();
}

it('prices the drop above what the garment costs to make', function () {
    $this->seed(StorefrontProductSeeder::class);
    $this->seed(DropSeeder::class);

    $tee = Product::where('slug', 'boxy-tee')->firstOrFail();
    $hoodie = Product::where('slug', 'heavy-hoodie')->firstOrFail();

    expect($tee->price_cents)->toBe(49_500)
        ->and($hoodie->price_cents)->toBe(99_500);

    // Variants carry their own price and the storefront prefers it, so a
    // product price that never reached them would be invisible at checkout.
    expect($tee->variants->pluck('price_cents')->unique()->all())->toBe([49_500]);
    expect($hoodie->variants->pluck('price_cents')->unique()->all())->toBe([99_500]);
});

it('clears free delivery on one hoodie or two tees, but not one tee', function () {
    $pricing = app(PricingService::class);

    $shipping = fn (int $subtotal) => $pricing->forSubtotal($subtotal, 'door')->toArray()['shipping_cents'];

    expect($shipping(49_500))->toBeGreaterThan(0)   // one tee
        ->and($shipping(99_000))->toBe(0)           // two tees
        ->and($shipping(99_500))->toBe(0);          // one hoodie
});

describe('the price migration', function () {
    beforeEach(function () {
        $this->seed(StorefrontProductSeeder::class);
    });

    it('replaces the seed placeholders', function () {
        DB::table('products')->where('slug', 'boxy-tee')->update(['price_cents' => 4_500]);

        runPriceMigration();

        expect(Product::where('slug', 'boxy-tee')->value('price_cents'))->toBe(49_500);
    });

    it('leaves a price someone set deliberately', function () {
        // Above the placeholder ceiling means a human chose it; a later deploy
        // must not quietly undo a price change made in the admin.
        DB::table('products')->where('slug', 'boxy-tee')->update(['price_cents' => 62_500]);

        runPriceMigration();

        expect(Product::where('slug', 'boxy-tee')->value('price_cents'))->toBe(62_500);
    });

    it('is a no-op the second time', function () {
        runPriceMigration();
        runPriceMigration();

        expect(Product::where('slug', 'heavy-hoodie')->value('price_cents'))->toBe(99_500);
    });
});
