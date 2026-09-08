<?php

namespace App\Services\PaymentGateway;

interface PaymentGatewayInterface
{
    /**
     * Initiate a payment
     * @return array{client_secret: string, payment_intent_id: string}|array{redirect_url: string}
     */
    public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array;

    /**
     * Confirm/capture a payment
     */
    public function confirm(string $paymentId, string $paymentMethodId = null): array;

    /**
     * Refund a payment
     */
    public function refund(string $paymentId, int $amountCents = null): array;

    /**
     * Handle webhook from payment gateway
     */
    public function handleWebhook(array $payload): array;

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $signature, string $body): bool;

    /**
     * Get gateway name
     */
    public function getName(): string;

    /**
     * Check if gateway is configured
     */
    public function isConfigured(): bool;
}
