<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('traffic_stats', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('path');
            $table->string('method', 8);
            $table->unsignedSmallInteger('status');
            $table->unsignedInteger('duration_ms');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('visited_at');
            $table->timestamps();
            $table->index(['date']);
            $table->index(['path']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('traffic_stats');
    }
};

