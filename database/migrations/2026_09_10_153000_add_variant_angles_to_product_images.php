<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A garment is not one photograph.
 *
 * A print that runs across the back needs the back shot and the front shot,
 * and which pair you get depends on which variant is selected. product_images
 * could only say "this picture belongs to this product", so a variant could
 * carry exactly one image_url and nothing could describe an angle.
 *
 * An image with a product_variant_id is one of that variant's angles; one
 * without stays what it always was, a picture of the product in general.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->foreignId('product_variant_id')
                ->nullable()
                ->after('product_id')
                ->constrained()
                ->cascadeOnDelete();

            // "Front", "Back", "Detail" — free text, because what is worth
            // shooting differs by garment and this is a label, not a taxonomy.
            $table->string('angle')->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_variant_id');
            $table->dropColumn('angle');
        });
    }
};
