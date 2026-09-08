<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SecuritySettingsController extends Controller
{
    public function index()
    {
        $settings = collect([
            'two_factor_enabled' => true,
            'ip_whitelist_enabled' => false,
            'password_expiry_days' => 0,
            'session_timeout_minutes' => 60,
            'api_key_rotation_days' => 90,
            'ssl_enabled' => true,
            'cors_enabled' => false,
        ])->all();

        $sessions = collect([
            ['id' => 1, 'device' => 'MacBook Pro', 'location' => 'Johannesburg, ZA', 'last_active' => 'Just now', 'ip' => '197.53.123.45'],
            ['id' => 2, 'device' => 'iPhone 12', 'location' => 'Johannesburg, ZA', 'last_active' => '2 hours ago', 'ip' => '197.53.124.50'],
            ['id' => 3, 'device' => 'Unknown Device', 'location' => 'Johannesburg, ZA', 'last_active' => '5 days ago', 'ip' => '105.27.100.100'],
        ])->all();

        return Inertia::render('settings/security', [
            'settings' => $settings,
            'sessions' => $sessions,
        ]);
    }

    public function update(Request $request)
    {
        return response()->json(['message' => 'Security settings updated successfully']);
    }

    public function revokeSession($sessionId)
    {
        return response()->json(['message' => 'Session revoked successfully']);
    }

    public function generateAPIKey()
    {
        return response()->json(['api_key' => 'sk_live_' . bin2hex(random_bytes(20))]);
    }
}
