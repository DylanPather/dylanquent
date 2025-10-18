<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->text('description')->nullable();
            // Pricing stored in minor units (e.g., cents)
            $table->unsignedBigInteger('price_cents');
            $table->unsignedBigInteger('compare_at_price_cents')->nullable();
            $table->string('currency', 3)->default('ZAR');
            // Inventory
            $table->boolean('track_inventory')->default(true);
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(0);
            // Product flags
            $table->boolean('is_active')->default(true);
            $table->json('attributes')->nullable(); // size/color/etc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
