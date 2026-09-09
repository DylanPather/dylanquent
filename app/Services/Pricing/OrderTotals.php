<?php

namespace App\Services\Pricing;

/**
 * The money breakdown for a basket. All values are in cents.
 */
readonly class OrderTotals
{
    public function __construct(
        public int $subtotalCents,
        public int $shippingCents,
        public int $taxCents,
        public int $totalCents,
        public bool $taxInclusive,
        public string $taxLabel,
        public ?int $freeShippingRemainingCents,
        public string $shippingMethod = 'door',
        public array $shippingOptions = [],
    ) {}

    /** Shape handed to the storefront. */
    public function toArray(): array
    {
        return [
            'subtotal_cents' => $this->subtotalCents,
            'shipping_cents' => $this->shippingCents,
            'tax_cents' => $this->taxCents,
            'total_cents' => $this->totalCents,
            'tax_inclusive' => $this->taxInclusive,
            'tax_label' => $this->taxLabel,
            'free_shipping_remaining_cents' => $this->freeShippingRemainingCents,
            'shipping_method' => $this->shippingMethod,
            'shipping_options' => $this->shippingOptions,
        ];
    }
}
