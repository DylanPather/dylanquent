<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = \App\Models\User::updateOrCreate(
            ['email' => 'admin@dylanquent.com'],
            [
                'name' => 'Admin User',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // The `role` column is legacy; the app reads Spatie roles.
        if (\Spatie\Permission\Models\Role::where('name', 'admin')->exists()) {
            $user->syncRoles(['admin']);
        }
    }
}
