<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ShipmentLabel;

class ShippingService
{
    public const CARRIERS = [
        'usps' => 'USPS',
        'ups' => 'UPS',
        'fedex' => 'FedEx',
        'dhl' => 'DHL',
    ];

    public function createLabel(Order $order, string $carrier, ?string $trackingNumber = null): ShipmentLabel
    {
        return ShipmentLabel::create([
            'order_id' => $order->id,
            'carrier' => $carrier,
            'tracking_number' => $trackingNumber,
            'generated_at' => now(),
        ]);
    }

    public function updateTracking(Order $order, string $carrier, string $trackingNumber): ShipmentLabel
    {
        $order->update([
            'tracking_number' => $trackingNumber,
        ]);

        return ShipmentLabel::updateOrCreate(
            ['order_id' => $order->id, 'carrier' => $carrier],
            ['tracking_number' => $trackingNumber, 'generated_at' => now()]
        );
    }

    public function getCarriers(): array
    {
        return self::CARRIERS;
    }

    public function markAsShipped(Order $order, string $carrier, ?string $trackingNumber = null): void
    {
        $order->update([
            'status' => 'fulfilled',
            'shipped_at' => now(),
            'tracking_number' => $trackingNumber,
        ]);

        if ($carrier) {
            $this->createLabel($order, $carrier, $trackingNumber);
        }
    }
}
