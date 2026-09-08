<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShippingSettingsController extends Controller
{
    public function index()
    {
        $settings = collect([
            'origin_country' => 'ZA',
            'origin_city' => 'Johannesburg',
            'origin_postal' => '2000',
            'default_carrier' => 'fedex',
            'calculate_weight' => true,
            'free_shipping_threshold' => 500,
            'free_shipping_enabled' => true,
            'pickup_enabled' => false,
        ])->all();

        return Inertia::render('settings/shipping', [
            'settings' => $settings,
            'carriers' => ['fedex', 'ups', 'dhl', 'usps', 'aramex'],
            'countries' => ['South Africa', 'United States', 'United Kingdom'],
        ]);
    }

    public function update(Request $request)
    {
        return response()->json(['message' => 'Shipping settings updated successfully']);
    }
}
