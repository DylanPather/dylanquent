<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('company')->nullable();
            $table->string('phone')->nullable();
            $table->string('project_type');
            $table->string('budget_range')->nullable();
            $table->string('timeline')->nullable();
            $table->text('message');
            $table->string('status')->default('new');
            $table->text('internal_notes')->nullable();
            $table->string('source')->default('studio');
            $table->string('ip_address')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_inquiries');
    }
};
