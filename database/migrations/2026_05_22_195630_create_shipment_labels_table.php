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
        Schema::create('shipment_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('carrier');
            $table->string('tracking_number')->nullable();
            $table->string('label_url')->nullable();
            $table->decimal('weight_oz', 8, 2)->nullable();
            $table->string('service_type')->nullable();
            $table->integer('cost_cents')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'carrier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_labels');
    }
};
