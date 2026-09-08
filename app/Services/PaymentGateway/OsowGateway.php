<?php

namespace App\Services\PaymentGateway;

use Illuminate\Support\Facades\Http;

class OsowGateway implements PaymentGatewayInterface
{
    private string $apiKey;
    private string $baseUrl = 'https://api.osow.co.za/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.osow.api_key');
    }

    public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
    {
        try {
            $amountRands = number_format($amountCents / 100, 2, '.', '');

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/transactions', [
                'amount' => $amountRands,
                'currency' => 'ZAR',
                'reference' => $orderId,
                'description' => $metadata['description'] ?? 'Order #' . $orderId,
                'return_url' => route('payment.success'),
                'cancel_url' => route('checkout.index'),
                'notify_url' => route('webhook.osow'),
                'metadata' => $metadata,
            ]);

            if ($response->status() === 201) {
                $data = $response->json();
                return [
                    'status' => 'initiated',
                    'gateway' => 'osow',
                    'payment_id' => $data['id'],
                    'redirect_url' => $data['payment_url'] ?? null,
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to create OSOW payment',
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
            ])->get($this->baseUrl . '/transactions/' . $paymentId);

            if ($response->status() === 200) {
                $data = $response->json();

                if ($data['status'] === 'completed') {
                    return [
                        'status' => 'success',
                        'gateway' => 'osow',
                        'payment_id' => $data['id'],
                        'amount' => intval($data['amount'] * 100),
                        'currency' => 'ZAR',
                    ];
                }

                return [
                    'status' => 'pending',
                    'payment_id' => $data['id'],
                ];
            }

            return [
                'status' => 'failed',
                'message' => 'Failed to verify payment',
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
            $amountRands = $amountCents ? number_format($amountCents / 100, 2, '.', '') : null;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->post($this->baseUrl . '/transactions/' . $paymentId . '/refund', [
                'amount' => $amountRands,
            ]);

            if ($response->status() === 200) {
                $data = $response->json();
                return [
                    'status' => 'success',
                    'gateway' => 'osow',
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
        $status = $payload['status'] ?? null;
        $transactionId = $payload['id'] ?? null;
        $reference = $payload['reference'] ?? null;

        return match ($status) {
            'completed' => [
                'status' => 'paid',
                'order_id' => $reference,
                'payment_id' => $transactionId,
                'amount' => intval(($payload['amount'] ?? 0) * 100),
            ],
            'failed' => [
                'status' => 'failed',
                'order_id' => $reference,
                'payment_id' => $transactionId,
                'reason' => $payload['failure_reason'] ?? 'Unknown',
            ],
            'pending' => [
                'status' => 'pending',
                'order_id' => $reference,
                'payment_id' => $transactionId,
            ],
            default => ['status' => 'unhandled'],
        };
    }

    public function verifyWebhookSignature(string $signature, string $body): bool
    {
        $secret = config('services.osow.webhook_secret');
        $hash = hash_hmac('sha256', $body, $secret);
        return hash_equals($hash, $signature);
    }

    public function getName(): string
    {
        return 'OSOW';
    }

    public function isConfigured(): bool
    {
        return (bool) config('services.osow.api_key');
    }
}
