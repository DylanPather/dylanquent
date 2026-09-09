<?php

namespace App\Services\Shipping;

/**
 * Source of delivery rates.
 *
 * Rates come from configuration today. A live courier aggregator (Bob Go,
 * Shiplogic) can be dropped in behind this interface without touching the
 * cart, the checkout or the order.
 */
interface ShippingRateProvider
{
    /**
     * Options to offer for a basket.
     *
     * @return array<int, ShippingRate>
     */
    public function ratesFor(int $subtotalCents, ?string $destinationPostcode = null): array;

    /** A single option by key, or null when it is not offered. */
    public function rate(string $method, int $subtotalCents, ?string $destinationPostcode = null): ?ShippingRate;
}
