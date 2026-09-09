<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class RegularUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'user@dylanquent.com';
        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => 'Regular User',
                'email' => $email,
                // Demo account: random unless explicitly set.
                'password' => Hash::make(env('DEMO_USER_PASSWORD') ?? Str::password(20)),
                'role' => 'user',
                'email_verified_at' => now(),
            ]);
        }

        if (Role::where('name', 'customer')->exists()) {
            $user->syncRoles(['customer']);
        }
    }
}
