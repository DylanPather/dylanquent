<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The Cargo Trouser and the Signature Cap were never real.
 *
 * Both came from the original storefront seeder as stock-photo placeholders to
 * give the shop grid four cards, and neither has a blank, a print, a supplier
 * or a photograph behind it. They were still on the storefront alongside the
 * three products that do exist — the Boxy Tee, the Heavy Hoodie and the
 * Development Tee — advertising a trouser and a cap the studio cannot ship.
 *
 * Matched on slug *and* SKU so this can only hit those exact seeded rows; a
 * real trouser or cap introduced later under the same slug is left alone.
 *
 * Follows 2026_09_10_141500_remove_placeholder_catalog_products: order lines
 * snapshot their own name and price, so the pointer back to the catalogue is
 * cleared rather than the history deleted, and the children go explicitly so
 * this behaves the same whether or not foreign keys are enforced.
 */
return new class extends Migration
{
    private const MOCKS = [
        ['slug' => 'cargo-trouser', 'sku' => 'DQ-TR-01'],
        ['slug' => 'signature-cap', 'sku' => 'DQ-CP-01'],
    ];

    /** Their stock photos, which nothing else references. */
    private const IMAGES = [
        '/images/products/cargo_pants_olive_1769346899867.png',
        '/images/products/streetwear_cap_black_1769346921972.png',
    ];

    public function up(): void
    {
        $this->pruneFeatured();

        $ids = collect(self::MOCKS)
            ->map(fn (array $row) => DB::table('products')
                ->where('slug', $row['slug'])
                ->where('sku', $row['sku'])
                ->value('id'))
            ->filter()
            ->values();

        if ($ids->isEmpty()) {
            return;
        }

        $variantIds = DB::table('product_variants')->whereIn('product_id', $ids)->pluck('id');

        // Keep the order history, drop only the pointer back to the catalogue.
        foreach (['order_items', 'purchase_order_items'] as $table) {
            DB::table($table)->whereIn('product_id', $ids)->update(['product_id' => null]);

            if ($variantIds->isNotEmpty()) {
                DB::table($table)->whereIn('product_variant_id', $variantIds)->update(['product_variant_id' => null]);
            }
        }

        if ($variantIds->isNotEmpty()) {
            DB::table('inventory_levels')->whereIn('product_variant_id', $variantIds)->delete();
            DB::table('inventory_movements')->whereIn('product_variant_id', $variantIds)->delete();
            DB::table('product_variants')->whereIn('id', $variantIds)->delete();
        }

        foreach (['product_images', 'reviews', 'category_product', 'collection_product', 'discount_product'] as $table) {
            DB::table($table)->whereIn('product_id', $ids)->delete();
        }

        DB::table('products')->whereIn('id', $ids)->delete();

        // Any gallery row still pointing at a deleted product's photo.
        DB::table('product_images')->whereIn('url', self::IMAGES)->delete();
    }

    /**
     * The homepage edit is a settings row, not a query over products, so
     * deleting the products alone would leave two cards linking to a 404.
     */
    private function pruneFeatured(): void
    {
        $setting = DB::table('storefront_settings')->where('key', 'featured_products')->first();

        if (! $setting) {
            return;
        }

        $featured = json_decode($setting->value, true);

        if (! is_array($featured)) {
            return;
        }

        $slugs = array_column(self::MOCKS, 'slug');

        $kept = array_values(array_filter(
            $featured,
            fn ($item) => ! in_array($item['slug'] ?? null, $slugs, true)
        ));

        if (count($kept) === count($featured)) {
            return;
        }

        // The tags were positional labels (01–04); renumber so the edit does
        // not read 01, 02 with a gap where the mocks were.
        foreach ($kept as $position => &$item) {
            $item['tag'] = str_pad((string) ($position + 1), 2, '0', STR_PAD_LEFT);
        }
        unset($item);

        DB::table('storefront_settings')
            ->where('key', 'featured_products')
            ->update(['value' => json_encode($kept)]);
    }

    /**
     * Irreversible on purpose: restoring these would put two products the
     * studio cannot make back on the shop floor.
     */
    public function down(): void
    {
        //
    }
};
