<?php

namespace App\Http\Controllers\Settings;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class IntegrationsController extends Controller
{
    public function index()
    {
        $integrations = collect([
            ['id' => 1, 'name' => 'Stripe', 'status' => 'connected', 'description' => 'Payment processing', 'icon' => 'CreditCard'],
            ['id' => 2, 'name' => 'Shopify', 'status' => 'not_connected', 'description' => 'Sync products and orders', 'icon' => 'ShoppingCart'],
            ['id' => 3, 'name' => 'Google Analytics', 'status' => 'connected', 'description' => 'Track visitor analytics', 'icon' => 'BarChart3'],
            ['id' => 4, 'name' => 'Mailchimp', 'status' => 'not_connected', 'description' => 'Email marketing automation', 'icon' => 'Mail'],
            ['id' => 5, 'name' => 'Zapier', 'status' => 'not_connected', 'description' => 'Automation & workflows', 'icon' => 'Zap'],
            ['id' => 6, 'name' => 'Klaviyo', 'status' => 'not_connected', 'description' => 'Email & SMS marketing', 'icon' => 'MessageSquare'],
        ])->all();

        return Inertia::render('settings/integrations', [
            'integrations' => $integrations,
        ]);
    }

    public function connect($integrationId)
    {
        return response()->json(['message' => 'Integration connected successfully']);
    }

    public function disconnect($integrationId)
    {
        return response()->json(['message' => 'Integration disconnected successfully']);
    }
}
