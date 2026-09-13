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

function runRepriceMigration(): void
{
    (require database_path('migrations/2026_09_13_100100_reprice_to_undercut_market.php'))->up();
}

/** The launch prices the repricing migration moves off. */
function priceAtLaunch(string $slug, int $cents): void
{
    $id = DB::table('products')->where('slug', $slug)->value('id');

    DB::table('products')->where('id', $id)->update(['price_cents' => $cents]);
    DB::table('product_variants')->where('product_id', $id)->update(['price_cents' => $cents]);
}

it('undercuts the market without going under what a run costs', function () {
    $this->seed(StorefrontProductSeeder::class);
    $this->seed(DropSeeder::class);

    $prices = Product::pluck('price_cents', 'slug');

    expect($prices['boxy-tee'])->toBe(44_900)
        ->and($prices['development-tee'])->toBe(49_900)
        ->and($prices['heavy-hoodie'])->toBe(89_900)
        ->and($prices['development-hoodie'])->toBe(94_900);

    // The run floors these have to clear — 85% sell-through, ~3.5% to the
    // gateway, free delivery absorbed. Derivation is in DropSeeder; this is
    // the guard rail, so a later price cut cannot quietly go under cost.
    // 10 made, 8.5 sold, each sold unit paying ~3.5% to the gateway and
    // $shippingShare of a R110 delivery the store absorbed:
    //
    //   8.5P >= 10C + 0.035(8.5P) + 8.5(110)(share)
    $floor = function (int $landedCents, float $shippingShare) {
        $sold = 8.5;
        $absorbed = $sold * 110_00 * $shippingShare;

        return (int) ceil((10 * $landedCents + $absorbed) / ($sold - 0.035 * $sold));
    };

    expect($prices['boxy-tee'])->toBeGreaterThan($floor(29_000, 0.5))
        ->and($prices['development-tee'])->toBeGreaterThan($floor(33_500, 0.5))
        ->and($prices['heavy-hoodie'])->toBeGreaterThan($floor(53_000, 1.0))
        ->and($prices['development-hoodie'])->toBeGreaterThan($floor(57_500, 1.0));

    // And still under the cheapest local comparable in each category.
    expect($prices['boxy-tee'])->toBeLessThan(60_000)         // Unseen Grail floor
        ->and($prices['heavy-hoodie'])->toBeLessThan(130_000); // Unseen Grail floor

    // Variants carry their own price and the storefront prefers it, so a
    // product price that never reached them would be invisible at checkout.
    foreach (['boxy-tee', 'development-tee', 'heavy-hoodie', 'development-hoodie'] as $slug) {
        $product = Product::where('slug', $slug)->firstOrFail();

        expect($product->variants->pluck('price_cents')->unique()->all())
            ->toBe([$product->price_cents]);
    }
});

it('clears free delivery on one hoodie or two tees, but not one tee', function () {
    $pricing = app(PricingService::class);

    $shipping = fn (int $subtotal) => $pricing->forSubtotal($subtotal, 'door')->toArray()['shipping_cents'];

    expect($shipping(44_900))->toBeGreaterThan(0)   // one tee
        ->and($shipping(89_800))->toBe(0)           // two tees
        ->and($shipping(89_900))->toBe(0);          // one hoodie
});

describe('the launch price migration', function () {
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
        DB::table('products')->where('slug', 'heavy-hoodie')->update(['price_cents' => 8_500]);

        runPriceMigration();
        runPriceMigration();

        expect(Product::where('slug', 'heavy-hoodie')->value('price_cents'))->toBe(99_500);
    });
});

describe('the repricing migration', function () {
    beforeEach(function () {
        $this->seed(StorefrontProductSeeder::class);
        $this->seed(DropSeeder::class);
    });

    it('moves a database still on the launch prices', function () {
        priceAtLaunch('boxy-tee', 49_500);
        priceAtLaunch('heavy-hoodie', 99_500);

        runRepriceMigration();

        $tee = Product::where('slug', 'boxy-tee')->firstOrFail();
        $hoodie = Product::where('slug', 'heavy-hoodie')->firstOrFail();

        expect($tee->price_cents)->toBe(44_900)
            ->and($hoodie->price_cents)->toBe(89_900)
            // The storefront reads the variant price, so a product-only move
            // would leave the shelf price unchanged.
            ->and($tee->variants->pluck('price_cents')->unique()->all())->toBe([44_900])
            ->and($hoodie->variants->pluck('price_cents')->unique()->all())->toBe([89_900]);
    });

    it('leaves a price someone set deliberately', function () {
        priceAtLaunch('boxy-tee', 72_500);

        runRepriceMigration();

        expect(Product::where('slug', 'boxy-tee')->value('price_cents'))->toBe(72_500);
    });

    it('is a no-op the second time', function () {
        priceAtLaunch('heavy-hoodie', 99_500);

        runRepriceMigration();
        runRepriceMigration();

        expect(Product::where('slug', 'heavy-hoodie')->value('price_cents'))->toBe(89_900);
    });

    it('puts a database back on the launch prices when rolled back', function () {
        priceAtLaunch('heavy-hoodie', 99_500);

        runRepriceMigration();
        (require database_path('migrations/2026_09_13_100100_reprice_to_undercut_market.php'))->down();

        $hoodie = Product::where('slug', 'heavy-hoodie')->firstOrFail();

        expect($hoodie->price_cents)->toBe(99_500)
            ->and($hoodie->variants->pluck('price_cents')->unique()->all())->toBe([99_500]);
    });
});
