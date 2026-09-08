<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class StoreSettingsController extends Controller
{
    public function index()
    {
        $settings = [
            'store_name' => config('app.name'),
            'store_email' => config('app.email', 'info@dylanquent.com'),
            'store_phone' => config('app.phone', ''),
            'store_address' => config('app.address', ''),
            'store_city' => config('app.city', ''),
            'store_country' => config('app.country', 'ZA'),
            'store_currency' => config('app.currency', 'ZAR'),
            'timezone' => config('app.timezone', 'Africa/Johannesburg'),
            'terms_url' => config('app.terms_url', ''),
            'privacy_url' => config('app.privacy_url', ''),
            'returns_url' => config('app.returns_url', ''),
        ];

        return Inertia::render('settings/store', [
            'settings' => $settings,
            'countries' => [
                'ZA' => 'South Africa',
                'US' => 'United States',
                'GB' => 'United Kingdom',
                'AU' => 'Australia',
                'CA' => 'Canada',
            ],
            'currencies' => [
                'ZAR' => 'South African Rand (R)',
                'USD' => 'US Dollar ($)',
                'GBP' => 'British Pound (£)',
                'AUD' => 'Australian Dollar (A$)',
                'CAD' => 'Canadian Dollar (C$)',
            ],
            'timezones' => [
                'Africa/Johannesburg' => 'Africa/Johannesburg',
                'Africa/Cairo' => 'Africa/Cairo',
                'Europe/London' => 'Europe/London',
                'America/New_York' => 'America/New_York',
                'America/Los_Angeles' => 'America/Los_Angeles',
                'Asia/Dubai' => 'Asia/Dubai',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_email' => 'required|email',
            'store_phone' => 'nullable|string',
            'store_address' => 'nullable|string',
            'store_city' => 'nullable|string',
            'store_country' => 'required|string|size:2',
            'store_currency' => 'required|string|size:3',
            'timezone' => 'required|string',
            'terms_url' => 'nullable|url',
            'privacy_url' => 'nullable|url',
            'returns_url' => 'nullable|url',
        ]);

        // In production, save to database
        // For now, we'll just return success

        return back()->with('success', 'Store settings updated successfully');
    }
}
