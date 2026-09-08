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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_gateway')->nullable()->after('notes');
            $table->string('payment_id')->nullable()->unique()->after('payment_gateway');
            $table->string('payment_status')->default('pending')->after('payment_id');
            $table->string('tracking_number')->nullable()->after('payment_status');
            $table->timestamp('shipped_at')->nullable()->after('tracking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'payment_id', 'payment_status', 'tracking_number', 'shipped_at']);
        });
    }
};
