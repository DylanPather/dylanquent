<?php

namespace App\Services\Pricing;

/**
 * Single source of truth for order money.
 *
 * The cart, the checkout summary and the order record all run through here,
 * so the figure a customer is shown is the figure they are charged.
 */
class PricingService
{
    /**
     * @param  int  $subtotalCents  Sum of line totals, before shipping and tax.
     */
    public function forSubtotal(int $subtotalCents): OrderTotals
    {
        $shipping = $this->shippingFor($subtotalCents);
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
        );
    }

    public function shippingFor(int $subtotalCents): int
    {
        $freeOver = (int) config('store.shipping.free_over_cents');

        if ($freeOver > 0 && $subtotalCents >= $freeOver) {
            return 0;
        }

        return (int) config('store.shipping.flat_cents');
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
