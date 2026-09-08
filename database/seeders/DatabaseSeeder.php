<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            RegularUserSeeder::class,
            StorefrontSettingsSeeder::class,
            CatalogSeeder::class,
            StorefrontInventorySeeder::class,
        ]);
    }
}
