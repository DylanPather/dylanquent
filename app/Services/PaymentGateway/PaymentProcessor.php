<?php

namespace App\Services\PaymentGateway;

class PaymentProcessor
{
    private array $gateways = [];

    public function __construct()
    {
        $this->registerGateways();
    }

    private function registerGateways(): void
    {
        $this->gateways = [
            'stripe' => new StripeGateway(),
            'paypal' => new PayPalGateway(),
            'osow' => new OsowGateway(),
            'yoco' => new YocoGateway(),
        ];
    }

    /**
     * Get a specific gateway
     */
    public function gateway(string $name): PaymentGatewayInterface
    {
        $gateway = $this->gateways[$name] ?? null;

        if (!$gateway) {
            throw new \Exception("Payment gateway '{$name}' not found");
        }

        if (!$gateway->isConfigured()) {
            throw new \Exception("Payment gateway '{$name}' is not configured");
        }

        return $gateway;
    }

    /**
     * Get all available gateways
     */
    public function availableGateways(): array
    {
        return collect($this->gateways)
            ->filter(fn($gateway) => $gateway->isConfigured())
            ->map(fn($gateway) => [
                'id' => array_search($gateway, $this->gateways),
                'name' => $gateway->getName(),
            ])
            ->values()
            ->all();
    }

    /**
     * Get default gateway based on customer location
     */
    public function getDefaultGateway(string $countryCode = null): string
    {
        $available = $this->availableGateways();

        if (empty($available)) {
            throw new \Exception('No payment gateways configured');
        }

        if ($countryCode === 'ZA') {
            $southAfricanGateways = ['osow', 'yoco'];
            foreach ($southAfricanGateways as $gateway) {
                if (in_array($gateway, array_column($available, 'id'))) {
                    return $gateway;
                }
            }
        }

        return $available[0]['id'] ?? 'stripe';
    }
}
