<?php

namespace App\Services\PaymentGateway;

use Illuminate\Support\Facades\Http;

class YocoGateway implements PaymentGatewayInterface
{
    private string $apiKey;
    private string $baseUrl = 'https://api.yoco.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.yoco.api_key');
    }

    public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/charges', [
                'amount' => $amountCents,
                'currency' => 'ZAR',
                'metadata' => array_merge(['order_id' => $orderId], $metadata),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => 'initiated',
                    'gateway' => 'yoco',
                    'payment_id' => $data['id'],
                    'client_token' => $data['client_token'] ?? null,
                ];
            }

            return [
                'status' => 'error',
                'message' => $response->json('message') ?? 'Failed to create Yoco charge',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function confirm(string $paymentId, string $paymentMethodId = null): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get($this->baseUrl . '/charges/' . $paymentId);

            if ($response->successful()) {
                $data = $response->json();

                if ($data['status'] === 'succeeded') {
                    return [
                        'status' => 'success',
                        'gateway' => 'yoco',
                        'payment_id' => $data['id'],
                        'amount' => $data['amount'],
                        'currency' => 'ZAR',
                    ];
                }

                if ($data['status'] === 'pending') {
                    return [
                        'status' => 'pending',
                        'payment_id' => $data['id'],
                    ];
                }

                return [
                    'status' => 'failed',
                    'payment_id' => $data['id'],
                    'reason' => $data['failure_reason'] ?? 'Unknown error',
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to verify charge status',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function refund(string $paymentId, int $amountCents = null): array
    {
        try {
            $body = [];
            if ($amountCents) {
                $body['amount'] = $amountCents;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->post($this->baseUrl . '/refunds', [
                'charge_id' => $paymentId,
                ...$body,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'status' => 'success',
                    'gateway' => 'yoco',
                    'refund_id' => $data['id'],
                ];
            }

            return [
                'status' => 'failed',
                'message' => $response->json('message') ?? 'Refund failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    public function handleWebhook(array $payload): array
    {
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];

        return match ($event) {
            'charge.succeeded' => [
                'status' => 'paid',
                'order_id' => $data['metadata']['order_id'] ?? null,
                'payment_id' => $data['id'],
                'amount' => $data['amount'],
            ],
            'charge.failed' => [
                'status' => 'failed',
                'order_id' => $data['metadata']['order_id'] ?? null,
                'payment_id' => $data['id'],
                'reason' => $data['failure_reason'] ?? 'Unknown',
            ],
            'refund.created' => [
                'status' => 'refunded',
                'refund_id' => $data['id'],
                'charge_id' => $data['charge_id'],
            ],
            default => ['status' => 'unhandled'],
        };
    }

    public function verifyWebhookSignature(string $signature, string $body): bool
    {
        $secret = config('services.yoco.webhook_secret');
        $hash = hash_hmac('sha256', $body, $secret);
        return hash_equals($hash, $signature);
    }

    public function getName(): string
    {
        return 'Yoco';
    }

    public function isConfigured(): bool
    {
        return (bool) config('services.yoco.api_key');
    }
}
