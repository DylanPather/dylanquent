<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });

        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });

        Schema::table('collections', function (Blueprint $table) {
            if (!Schema::hasColumn('collections', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });

        Schema::table('discounts', function (Blueprint $table) {
            if (!Schema::hasColumn('discounts', 'store_id')) {
                $table->foreignId('store_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
                $table->index('store_id');
            }
        });
    }

    public function down(): void
    {
        foreach (['products', 'orders', 'customers', 'categories', 'collections', 'discounts'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'store_id')) {
                    $table->dropForeignKeyIfExists(['store_id']);
                    if (Schema::hasIndex($tableName, 'store_id')) {
                        $table->dropIndex(['store_id']);
                    }
                    $table->dropColumn('store_id');
                }
            });
        }
    }
};
