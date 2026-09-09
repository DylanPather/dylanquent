<?php

namespace App\Services\Shipping;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Live courier rates from Bob Go.
 *
 * Bob Go aggregates The Courier Guy, Pargo, RAM, SkyNet, Aramex and others
 * behind one API, so a single integration quotes several couriers.
 *
 * IMPORTANT: the endpoints, base URLs and bearer auth below are confirmed,
 * but the exact request and response field names have not been verified
 * against a live sandbox account. Run the artisan command shipping:probe
 * with a sandbox key before trusting this in production — the response
 * mapping in toRates() is the part most likely to need adjusting.
 *
 * Any failure falls back to configured flat rates: a courier outage must
 * never stop someone checking out.
 */
class BobGoRateProvider implements ShippingRateProvider
{
    private const SANDBOX_URL = 'https://api.sandbox.bobgo.co.za/v2';
    private const PRODUCTION_URL = 'https://api.bobgo.co.za/v2';

    public function __construct(private ConfiguredRateProvider $fallback) {}

    public function ratesFor(int $subtotalCents, ?string $destinationPostcode = null): array
    {
        // Free-delivery threshold is a shop rule, not a courier one.
        if ($this->qualifiesForFree($subtotalCents)) {
            return $this->fallback->ratesFor($subtotalCents, $destinationPostcode);
        }

        $rates = $this->fetch($destinationPostcode);

        return $rates ?: $this->fallback->ratesFor($subtotalCents, $destinationPostcode);
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

    public function baseUrl(): string
    {
        return config('store.shipping.bobgo.sandbox') ? self::SANDBOX_URL : self::PRODUCTION_URL;
    }

    /**
     * @return array<int, ShippingRate>|null  null when the call could not be made.
     */
    private function fetch(?string $destinationPostcode): ?array
    {
        $token = config('store.shipping.bobgo.token');

        if (! $token) {
            return null;
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout((int) config('store.shipping.bobgo.timeout', 6))
                ->post($this->baseUrl().'/rates', $this->payload($destinationPostcode));

            if (! $response->successful()) {
                Log::warning('Bob Go rate request failed', [
                    'status' => $response->status(),
                    'body' => mb_substr($response->body(), 0, 500),
                ]);

                return null;
            }

            return $this->toRates($response->json());
        } catch (\Throwable $e) {
            Log::warning('Bob Go rate request threw', ['message' => $e->getMessage()]);

            return null;
        }
    }

    private function payload(?string $destinationPostcode): array
    {
        $origin = config('store.shipping.bobgo.origin');
        $parcel = config('store.shipping.bobgo.default_parcel');

        return [
            'collection_address' => [
                'company' => $origin['company'],
                'street_address' => $origin['street_address'],
                'local_area' => $origin['local_area'],
                'city' => $origin['city'],
                'zone' => $origin['zone'],
                'code' => $origin['code'],
                'country' => $origin['country'],
            ],
            'delivery_address' => [
                'code' => $destinationPostcode,
                'country' => 'ZA',
            ],
            'parcels' => [[
                'submitted_length_cm' => $parcel['length_cm'],
                'submitted_width_cm' => $parcel['width_cm'],
                'submitted_height_cm' => $parcel['height_cm'],
                'submitted_weight_kg' => $parcel['weight_kg'],
            ]],
        ];
    }

    /**
     * Map the API response onto our rate objects.
     *
     * Written against the documented shape; verify with shipping:probe.
     *
     * @return array<int, ShippingRate>|null
     */
    private function toRates(mixed $body): ?array
    {
        $rows = $body['rates'] ?? $body['data'] ?? null;

        if (! is_array($rows) || $rows === []) {
            Log::warning('Bob Go returned no usable rates', ['keys' => array_keys((array) $body)]);

            return null;
        }

        $rates = [];

        foreach ($rows as $row) {
            $amount = $row['rate'] ?? $row['charge'] ?? $row['total'] ?? null;

            if ($amount === null) {
                continue;
            }

            $slug = (string) ($row['service_level']['code'] ?? $row['service_level_code'] ?? $row['provider_slug'] ?? 'courier');

            $rates[] = new ShippingRate(
                method: $slug,
                label: (string) ($row['service_level']['name'] ?? $row['provider'] ?? 'Courier'),
                description: (string) ($row['service_level']['description'] ?? ''),
                // Bob Go quotes in Rand; we store cents.
                cents: (int) round(((float) $amount) * 100),
            );
        }

        usort($rates, fn ($a, $b) => $a->cents <=> $b->cents);

        return $rates ?: null;
    }

    private function qualifiesForFree(int $subtotalCents): bool
    {
        $threshold = (int) config('store.shipping.free_over_cents');

        return $threshold > 0 && $subtotalCents >= $threshold;
    }
}
