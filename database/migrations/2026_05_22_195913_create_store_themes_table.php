<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('primary_color')->default('#000000');
            $table->string('secondary_color')->default('#666666');
            $table->string('accent_color')->default('#3b82f6');
            $table->string('background_color')->default('#ffffff');
            $table->string('text_color')->default('#1f2937');
            $table->string('font_family')->default('system-ui, -apple-system, sans-serif');
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_themes');
    }
};
