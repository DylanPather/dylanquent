<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentSettingsController extends Controller
{
    public function show()
    {
        $gateways = [
            'stripe' => [
                'name' => 'Stripe',
                'fields' => ['public_key', 'secret_key'],
                'description' => 'Accept payments globally via Stripe',
            ],
            'paypal' => [
                'name' => 'PayPal',
                'fields' => ['client_id', 'client_secret', 'mode'],
                'description' => 'Accept payments via PayPal',
            ],
            'osow' => [
                'name' => 'OSOW (South Africa)',
                'fields' => ['api_key', 'merchant_id'],
                'description' => 'South African payment processor',
            ],
            'yoco' => [
                'name' => 'Yoco (South Africa)',
                'fields' => ['api_key', 'secret_key'],
                'description' => 'South African card payments',
            ],
        ];

        $credentials = [];
        foreach (array_keys($gateways) as $gateway) {
            $credentials[$gateway] = [
                'public_key' => config("services.{$gateway}.public_key"),
                'secret_key' => config("services.{$gateway}.secret_key"),
                'client_id' => config("services.{$gateway}.client_id"),
                'client_secret' => config("services.{$gateway}.client_secret"),
                'api_key' => config("services.{$gateway}.api_key"),
                'merchant_id' => config("services.{$gateway}.merchant_id"),
                'mode' => config("services.{$gateway}.mode"),
            ];
        }

        return Inertia::render('system/payment-settings', [
            'gateways' => $gateways,
            'credentials' => $credentials,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'stripe.public_key' => 'nullable|string',
            'stripe.secret_key' => 'nullable|string',
            'paypal.client_id' => 'nullable|string',
            'paypal.client_secret' => 'nullable|string',
            'paypal.mode' => 'nullable|in:sandbox,live',
            'osow.api_key' => 'nullable|string',
            'osow.merchant_id' => 'nullable|string',
            'yoco.api_key' => 'nullable|string',
            'yoco.secret_key' => 'nullable|string',
        ]);

        // Store in .env file or environment
        $envFile = base_path('.env');
        foreach ($validated as $gateway => $credentials) {
            foreach ($credentials as $key => $value) {
                if ($value !== null) {
                    $envKey = 'SERVICES_'.strtoupper($gateway).'_'.strtoupper($key);
                    $this->updateEnv($envKey, $value);
                }
            }
        }

        return back()->with('success', 'Payment settings updated successfully. You may need to clear cache.');
    }

    private function updateEnv(string $key, string $value): void
    {
        $envFile = base_path('.env');
        $envContent = file_get_contents($envFile);

        if (strpos($envContent, "{$key}=") !== false) {
            $envContent = preg_replace("/^{$key}=.*$/m", "{$key}={$value}", $envContent);
        } else {
            $envContent .= "\n{$key}={$value}";
        }

        file_put_contents($envFile, $envContent);
    }
}
