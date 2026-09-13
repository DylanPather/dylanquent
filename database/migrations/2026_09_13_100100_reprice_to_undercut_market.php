<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Repricing to undercut the local market.
 *
 * The launch figures in 2026_09_10_143000 were picked off comparables rather
 * than off what a run costs. These are picked the other way round: the lowest
 * price that still clears a batch, then checked against the market to confirm
 * it undercuts rather than matches.
 *
 *   Boxy Tee            R495 -> R449    ~30% under the local graphic tee
 *   Development Tee     R495 -> R499    as above, second print location
 *   Heavy Hoodie        R995 -> R899    ~35% under the local hoodie, under R1 000
 *   Development Hoodie  new     R949    as above, second print location
 *
 * For reference, the market these sit under: tees Sol-Sol R700, Butan
 * R699–799, Unseen Grail R600–700; hoodies Butan R1 499–1 599, Unseen Grail
 * R1 300–1 500, We Are Gods R2 499.
 *
 * The floor each figure clears, and the assumptions behind it — 85% of a batch
 * sells, ~3.5% to the gateway, free delivery absorbed — are written out beside
 * each product in DropSeeder. Change them there and here together.
 *
 * As with the launch prices: set in a migration because production runs
 * migrations on deploy but is not re-seeded.
 */
return new class extends Migration
{
    /**
     * slug => [price it was launched at, price it moves to].
     *
     * Guarded on the old price rather than applied flat, so a price already
     * changed by hand in the admin is not silently overwritten. The
     * Development Hoodie is absent because it is new — it arrives priced.
     */
    private const REPRICED = [
        'boxy-tee' => [49_500, 44_900],
        'development-tee' => [49_500, 49_900],
        'heavy-hoodie' => [99_500, 89_900],
    ];

    public function up(): void
    {
        $this->move(fn (array $prices) => $prices);
    }

    public function down(): void
    {
        $this->move(fn (array $prices) => array_reverse($prices));
    }

    /** @param  callable(array{0:int,1:int}): array{0:int,1:int}  $direction */
    private function move(callable $direction): void
    {
        foreach (self::REPRICED as $slug => $prices) {
            [$from, $to] = $direction($prices);

            $product = DB::table('products')->where('slug', $slug)->first();

            if (! $product || $product->price_cents !== $from) {
                continue;
            }

            DB::table('products')->where('id', $product->id)->update(['price_cents' => $to]);

            // Variants carry their own price and the storefront prefers it, so
            // a product-only move would leave the shelf price unchanged. Only
            // the ones still on the old price move, for the same reason the
            // product itself is guarded.
            DB::table('product_variants')
                ->where('product_id', $product->id)
                ->where('price_cents', $from)
                ->update(['price_cents' => $to]);
        }
    }
};
