<?php

namespace App\Services\PaymentGateway;

use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeGateway implements PaymentGatewayInterface
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
    {
        try {
            $intent = $this->stripe->paymentIntents->create([
                'amount' => $amountCents,
                'currency' => strtolower($currency),
                'metadata' => array_merge(['order_id' => $orderId], $metadata),
                'automatic_payment_methods' => ['enabled' => true],
            ]);

            return [
                'status' => 'initiated',
                'gateway' => 'stripe',
                'payment_id' => $intent->id,
                'client_secret' => $intent->client_secret,
                'amount' => $amountCents,
                'currency' => $currency,
            ];
        } catch (ApiErrorException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => $e->getStripeCode(),
            ];
        }
    }

    public function confirm(string $paymentId, string $paymentMethodId = null): array
    {
        try {
            $intent = $this->stripe->paymentIntents->retrieve($paymentId, [
                'expand' => ['payment_method'],
            ]);

            if ($intent->status === 'succeeded') {
                return [
                    'status' => 'success',
                    'gateway' => 'stripe',
                    'payment_id' => $intent->id,
                    'amount' => $intent->amount,
                    'currency' => strtoupper($intent->currency),
                ];
            }

            if ($intent->status === 'processing') {
                return [
                    'status' => 'processing',
                    'gateway' => 'stripe',
                    'payment_id' => $intent->id,
                ];
            }

            return [
                'status' => 'failed',
                'gateway' => 'stripe',
                'message' => 'Payment intent status: ' . $intent->status,
                'payment_id' => $intent->id,
            ];
        } catch (ApiErrorException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => $e->getStripeCode(),
            ];
        }
    }

    public function refund(string $paymentId, int $amountCents = null): array
    {
        try {
            $refund = $this->stripe->refunds->create([
                'payment_intent' => $paymentId,
                'amount' => $amountCents,
            ]);

            return [
                'status' => 'success',
                'gateway' => 'stripe',
                'refund_id' => $refund->id,
                'amount' => $refund->amount,
            ];
        } catch (ApiErrorException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function handleWebhook(array $payload): array
    {
        $event = $payload['type'] ?? null;
        $data = $payload['data']['object'] ?? [];

        return match ($event) {
            'payment_intent.succeeded' => [
                'status' => 'paid',
                'order_id' => $data['metadata']['order_id'] ?? null,
                'payment_id' => $data['id'],
                'amount' => $data['amount'],
                'currency' => strtoupper($data['currency']),
            ],
            'payment_intent.payment_failed' => [
                'status' => 'failed',
                'order_id' => $data['metadata']['order_id'] ?? null,
                'payment_id' => $data['id'],
                'reason' => $data['last_payment_error']['message'] ?? 'Unknown error',
            ],
            'charge.refunded' => [
                'status' => 'refunded',
                'order_id' => $data['metadata']['order_id'] ?? null,
                'payment_id' => $data['payment_intent'],
            ],
            default => ['status' => 'unhandled'],
        };
    }

    public function verifyWebhookSignature(string $signature, string $body): bool
    {
        try {
            $secret = config('services.stripe.webhook_secret');
            \Stripe\Webhook::constructEvent($body, $signature, $secret);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getName(): string
    {
        return 'Stripe';
    }

    public function isConfigured(): bool
    {
        return (bool) config('services.stripe.secret');
    }
}
