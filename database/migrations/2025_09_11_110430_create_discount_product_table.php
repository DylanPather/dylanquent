<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * discount_product was originally created inside create_discounts_table,
     * which shares a timestamp with create_products_table and sorts before it.
     * SQLite accepted the forward foreign key; Postgres rejects it.
     */
    public function up(): void
    {
        if (Schema::hasTable('discount_product')) {
            return;
        }

        Schema::create('discount_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discount_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['discount_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_product');
    }
};
