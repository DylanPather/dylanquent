<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@dylanquent.com');
        $existing = User::where('email', $email)->first();

        // Only ever set a password when creating the account. Re-seeding an
        // existing admin used to reset it, silently undoing any change made
        // through the UI.
        if ($existing) {
            $existing->update(['role' => 'admin', 'email_verified_at' => $existing->email_verified_at ?? now()]);
            $this->assignRole($existing);

            return;
        }

        $password = env('ADMIN_PASSWORD');
        $generated = $password === null;

        if ($generated) {
            $password = Str::password(20);
        }

        $user = User::create([
            'name' => env('ADMIN_NAME', 'Admin User'),
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->assignRole($user);

        if ($generated) {
            // Printed once, never committed. Set ADMIN_PASSWORD to choose your own.
            $this->command?->warn("Generated admin password for {$email}: {$password}");
            $this->command?->warn('Store it now — it is not shown again.');
        }
    }

    private function assignRole(User $user): void
    {
        if (Role::where('name', 'admin')->exists()) {
            $user->syncRoles(['admin']);
        }
    }
}
