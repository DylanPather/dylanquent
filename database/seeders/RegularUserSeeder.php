<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegularUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = \App\Models\User::updateOrCreate(
            ['email' => 'user@dylanquent.com'],
            [
                'name' => 'Regular User',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        if (\Spatie\Permission\Models\Role::where('name', 'customer')->exists()) {
            $user->syncRoles(['customer']);
        }
    }
}
