<?php

namespace App\Services\Shipping;

/**
 * Flat rates from config/store.php, with the free-delivery threshold applied.
 *
 * Deliberately has no notion of weight or destination — swap in a courier API
 * provider when those start to matter.
 */
class ConfiguredRateProvider implements ShippingRateProvider
{
    public function ratesFor(int $subtotalCents, ?string $destinationPostcode = null): array
    {
        $free = $this->qualifiesForFree($subtotalCents);

        return collect(config('store.shipping.methods', []))
            ->map(fn (array $m, string $key) => new ShippingRate(
                method: $key,
                label: $m['label'],
                description: $m['description'] ?? '',
                cents: $free ? 0 : (int) $m['cents'],
                free: $free,
            ))
            ->values()
            ->all();
    }

    public function rate(string $method, int $subtotalCents, ?string $destinationPostcode = null): ?ShippingRate
    {
        foreach ($this->ratesFor($subtotalCents, $destinationPostcode) as $rate) {
            if ($rate->method === $method) {
                return $rate;
            }
        }

        return null;
    }

    private function qualifiesForFree(int $subtotalCents): bool
    {
        $threshold = (int) config('store.shipping.free_over_cents');

        return $threshold > 0 && $subtotalCents >= $threshold;
    }
}
