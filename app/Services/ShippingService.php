<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ShipmentLabel;

class ShippingService
{
    /**
     * Carriers used for South African fulfilment. The previous list (USPS,
     * UPS, FedEx) was US-centric and none of it applies to a domestic SA
     * store.
     */
    public const CARRIERS = [
        'courier_guy' => 'The Courier Guy',
        'pudo' => 'PUDO (locker)',
        'aramex' => 'Aramex South Africa',
        'ram' => 'RAM Hand-to-Hand',
        'internet_express' => 'Internet Express',
        'skynet' => 'SkyNet South Africa',
        'postnet' => 'PostNet',
        'dhl' => 'DHL (international)',
    ];

    /** Carrier tracking pages, for linking a waybill from an order. */
    public const TRACKING_URLS = [
        'courier_guy' => 'https://portal.thecourierguy.co.za/track?ref=',
        'pudo' => 'https://www.pudo.co.za/track.php?ref=',
        'aramex' => 'https://www.aramex.co.za/track/results?ShipmentNumber=',
        'ram' => 'https://www.ram.co.za/track?waybill=',
        'skynet' => 'https://www.skynet.co.za/Track?waybill=',
        'dhl' => 'https://www.dhl.com/za-en/home/tracking.html?tracking-id=',
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

    /** Public tracking link for a waybill, when the carrier publishes one. */
    public function trackingUrl(string $carrier, string $trackingNumber): ?string
    {
        $base = self::TRACKING_URLS[$carrier] ?? null;

        return $base ? $base.urlencode($trackingNumber) : null;
    }

    public function markAsShipped(Order $order, string $carrier, ?string $trackingNumber = null): void
    {
        $order->update([
            'status' => OrderStatus::Fulfilled,
            'shipped_at' => now(),
            'tracking_number' => $trackingNumber,
        ]);

        if ($carrier) {
            $this->createLabel($order, $carrier, $trackingNumber);
        }
    }
}
