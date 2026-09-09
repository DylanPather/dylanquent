<?php

namespace App\Services\Shipping;

readonly class ShippingRate
{
    public function __construct(
        public string $method,
        public string $label,
        public string $description,
        public int $cents,
        /** True when a free-delivery threshold zeroed this rate. */
        public bool $free = false,
    ) {}

    public function toArray(): array
    {
        return [
            'method' => $this->method,
            'label' => $this->label,
            'description' => $this->description,
            'cents' => $this->cents,
            'free' => $this->free,
        ];
    }
}
