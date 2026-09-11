<?php

namespace App\Services\Pricing;

use App\Services\Shipping\ShippingRateProvider;

/**
 * Single source of truth for order money.
 *
 * The cart, the checkout summary and the order record all run through here,
 * so the figure a customer is shown is the figure they are charged.
 */
class PricingService
{
    public function __construct(private ShippingRateProvider $rates) {}

    /**
     * @param  int  $subtotalCents  Sum of line totals, before shipping and tax.
     * @param  string|null  $method  Delivery option key; falls back to the default.
     */
    public function forSubtotal(int $subtotalCents, ?string $method = null): OrderTotals
    {
        $shipping = $this->shippingFor($subtotalCents, $method);
        $charged = $subtotalCents + $shipping;

        [$tax, $total] = $this->taxFor($charged);

        return new OrderTotals(
            subtotalCents: $subtotalCents,
            shippingCents: $shipping,
            taxCents: $tax,
            totalCents: $total,
            taxInclusive: (bool) config('store.tax.inclusive'),
            taxLabel: (string) config('store.tax.label'),
            freeShippingRemainingCents: $this->remainingForFreeShipping($subtotalCents),
            shippingMethod: $method ?: (string) config('store.shipping.default_method'),
            shippingOptions: $this->shippingOptions($subtotalCents),
        );
    }

    /**
     * Build totals from a delivery charge that has already been quoted,
     * so a live courier rate flows through the same tax and total logic.
     */
    public function forQuotedShipping(int $subtotalCents, int $shippingCents): OrderTotals
    {
        [$tax, $total] = $this->taxFor($subtotalCents + $shippingCents);

        return new OrderTotals(
            subtotalCents: $subtotalCents,
            shippingCents: $shippingCents,
            taxCents: $tax,
            totalCents: $total,
            taxInclusive: (bool) config('store.tax.inclusive'),
            taxLabel: (string) config('store.tax.label'),
            freeShippingRemainingCents: $this->remainingForFreeShipping($subtotalCents),
        );
    }

    public function shippingFor(int $subtotalCents, ?string $method = null): int
    {
        return $this->resolveRate($subtotalCents, $method)?->cents ?? 0;
    }

    /** Options to show the customer at checkout. */
    public function shippingOptions(int $subtotalCents): array
    {
        return array_map(fn ($r) => $r->toArray(), $this->rates->ratesFor($subtotalCents));
    }

    private function resolveRate(int $subtotalCents, ?string $method)
    {
        $key = $method ?: config('store.shipping.default_method');

        return $this->rates->rate($key, $subtotalCents)
            // An unknown or withdrawn method must not silently become free.
            ?? $this->rates->rate(config('store.shipping.default_method'), $subtotalCents);
    }

    /**
     * How much more the customer must spend to earn free delivery,
     * or null when the threshold is disabled or already met.
     */
    public function remainingForFreeShipping(int $subtotalCents): ?int
    {
        $freeOver = (int) config('store.shipping.free_over_cents');

        if ($freeOver <= 0 || $subtotalCents >= $freeOver) {
            return null;
        }

        return $freeOver - $subtotalCents;
    }

    /**
     * @return array{0: int, 1: int} [taxCents, totalCents]
     */
    private function taxFor(int $chargedCents): array
    {
        if (! config('store.tax.enabled')) {
            return [0, $chargedCents];
        }

        $rate = (float) config('store.tax.rate');

        // Inclusive: tax is already inside the price, so back it out rather
        // than adding to it — the customer pays the ticket price.
        if (config('store.tax.inclusive')) {
            return [(int) round($chargedCents * $rate / (1 + $rate)), $chargedCents];
        }

        $tax = (int) round($chargedCents * $rate);

        return [$tax, $chargedCents + $tax];
    }
}
