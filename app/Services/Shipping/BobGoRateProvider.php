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
     * Verified against the sandbox. Quotes are nested two levels deep:
     * provider_rate_requests[] -> responses[], with one entry per courier
     * per service level. Several couriers usually quote the same journey.
     *
     * rate_amount includes VAT; rate_amount_excl_vat does not. Dylanquent is
     * not VAT registered and so cannot reclaim it — the inclusive figure is
     * the real cost and the one passed on.
     *
     * @return array<int, ShippingRate>|null
     */
    private function toRates(mixed $body): ?array
    {
        $requests = $body['provider_rate_requests'] ?? null;

        if (! is_array($requests)) {
            Log::warning('Bob Go response missing provider_rate_requests', [
                'keys' => array_keys((array) $body),
            ]);

            return null;
        }

        $quotes = [];

        foreach ($requests as $request) {
            if (($request['status'] ?? null) !== 'success') {
                continue;
            }

            foreach ($request['responses'] ?? [] as $response) {
                if (($response['status'] ?? null) !== 'success') {
                    continue;
                }

                $amount = $response['rate_amount'] ?? null;

                if ($amount === null) {
                    continue;
                }

                $level = $response['service_level'] ?? [];

                $quotes[] = [
                    // Groups door-to-door and locker quotes separately so the
                    // customer chooses a delivery style, not a courier.
                    'type' => (string) ($level['delivery_type'] ?? 'door'),
                    'provider' => (string) ($request['provider_name'] ?? $request['provider_slug'] ?? 'Courier'),
                    'name' => (string) ($level['name'] ?? $response['service_level_code'] ?? 'Delivery'),
                    'description' => (string) ($level['description'] ?? ''),
                    'cents' => (int) round(((float) $amount) * 100),
                ];
            }
        }

        if ($quotes === []) {
            $failures = collect($requests)
                ->filter(fn ($r) => ($r['status'] ?? null) !== 'success')
                ->pluck('failed_reason', 'provider_slug')
                ->all();

            Log::warning('Bob Go returned no successful quotes', ['failures' => $failures]);

            return null;
        }

        // Cheapest courier wins within each delivery style.
        $best = [];

        foreach ($quotes as $quote) {
            $type = $quote['type'];

            if (! isset($best[$type]) || $quote['cents'] < $best[$type]['cents']) {
                $best[$type] = $quote;
            }
        }

        $rates = array_map(
            fn (array $q) => new ShippingRate(
                method: $q['type'],
                label: $this->labelFor($q['type'], $q['provider']),
                description: $q['description'],
                cents: $q['cents'],
            ),
            array_values($best),
        );

        usort($rates, fn ($a, $b) => $a->cents <=> $b->cents);

        return $rates;
    }

    private function labelFor(string $type, string $provider): string
    {
        $style = match ($type) {
            'locker' => 'Locker collection',
            'pickup_point' => 'Collection point',
            'door' => 'Door-to-door courier',
            default => ucfirst(str_replace('_', ' ', $type)),
        };

        return "{$style} ({$provider})";
    }

    private function qualifiesForFree(int $subtotalCents): bool
    {
        $threshold = (int) config('store.shipping.free_over_cents');

        return $threshold > 0 && $subtotalCents >= $threshold;
    }
}
