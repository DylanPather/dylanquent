<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A variant can look different from the product's primary shot — a graphic
     * drop is the same blank in five prints — so it carries its own image and
     * the gallery follows the selected option.
     */
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('barcode');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });
    }
};
