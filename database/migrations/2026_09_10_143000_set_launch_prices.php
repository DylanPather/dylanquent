<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Launch pricing.
 *
 * The catalogue was still carrying the placeholder figures it was seeded with
 * — R45 for a printed heavyweight tee, R85 for a 400GSM hoodie — both below
 * what the blank alone costs in South Africa.
 *
 * Prices are inclusive of VAT by convention (config/store.php), even though
 * the store is not VAT registered yet, so registering later does not move the
 * shelf price. Set here rather than in a seeder because production runs
 * migrations on deploy but is not re-seeded; a migration runs once, so a price
 * later changed in the admin stays changed.
 */
return new class extends Migration
{
    /**
     * Keyed by slug. Anything not listed, or already priced above the
     * placeholder ceiling, is left alone.
     */
    private const PRICES = [
        'boxy-tee' => 49_500,
        'heavy-hoodie' => 99_500,
        'cargo-trouser' => 89_500,
        'signature-cap' => 39_500,
    ];

    /**
     * Above this, a price was set deliberately by a human and is not ours to
     * overwrite — this migration is only here to clear the seed placeholders.
     */
    private const PLACEHOLDER_CEILING = 20_000;

    public function up(): void
    {
        foreach (self::PRICES as $slug => $cents) {
            $product = DB::table('products')->where('slug', $slug)->first();

            if (! $product || $product->price_cents > self::PLACEHOLDER_CEILING) {
                continue;
            }

            DB::table('products')->where('id', $product->id)->update(['price_cents' => $cents]);

            // Variants carry their own price, and the storefront prefers it.
            DB::table('product_variants')
                ->where('product_id', $product->id)
                ->update(['price_cents' => $cents]);
        }
    }

    /**
     * Irreversible: rolling back would restore prices that do not cover the
     * cost of the garment.
     */
    public function down(): void
    {
        //
    }
};
