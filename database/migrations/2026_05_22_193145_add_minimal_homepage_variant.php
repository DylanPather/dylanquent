<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('storefront_settings')->updateOrInsert(
            ['key' => 'homepage_version'],
            ['value' => 'minimal', 'type' => 'string']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('storefront_settings')->where('key', 'homepage_version')->delete();
    }
};
