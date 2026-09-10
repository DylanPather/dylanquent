<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Two rows left over from early admin testing were live on the storefront:
 * "Boxy Tee - Midnight" at R126 and "Heavy Hoodie - Shadow" at R3.09, the
 * latter with a keyboard-mash slug and SKU.
 *
 * Matched on slug *and* SKU so this can only ever hit those exact rows — a
 * real product that happens to reuse one of the slugs is left alone.
 *
 * Order lines snapshot the name, quantity and price they were placed at, so
 * clearing the product reference keeps the history readable; that is what the
 * nullOnDelete on order_items is for. The children are removed explicitly
 * rather than left to the cascade, so this behaves the same whether or not
 * foreign keys are enforced on the connection.
 */
return new class extends Migration
{
    private const PLACEHOLDERS = [
        ['slug' => 'black-shirt', 'sku' => 'TS-BLACK-S'],
        ['slug' => 'rwrfdfdf', 'sku' => 'dfsdfdsfsd'],
    ];

    public function up(): void
    {
        $ids = collect(self::PLACEHOLDERS)
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
    }

    /**
     * Irreversible on purpose: these were junk, and inventing rows to stand in
     * for them on a rollback would put the same nonsense back in the shop.
     */
    public function down(): void
    {
        //
    }
};
