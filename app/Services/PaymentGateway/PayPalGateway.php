<?php

namespace App\Services\PaymentGateway;

use Illuminate\Support\Facades\Http;

class PayPalGateway implements PaymentGatewayInterface
{
    private string $clientId;
    private string $clientSecret;
    private string $mode;
    private string $baseUrl;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
        $this->mode = config('services.paypal.mode', 'sandbox');
        $this->baseUrl = $this->mode === 'live'
            ? 'https://api.paypal.com/v2'
            : 'https://api.sandbox.paypal.com/v2';
    }

    private function getAccessToken(): string
    {
        $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
            ->post($this->baseUrl === 'https://api.paypal.com/v2' ? 'https://api.paypal.com/v1' : 'https://api.sandbox.paypal.com/v1' . '/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        return $response->json('access_token');
    }

    public function initiate(int $amountCents, string $currency, string $orderId, array $metadata = []): array
    {
        try {
            $token = $this->getAccessToken();
            $amount = number_format($amountCents / 100, 2, '.', '');

            $response = Http::withToken($token)
                ->post($this->baseUrl . '/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'reference_id' => $orderId,
                            'amount' => [
                                'currency_code' => strtoupper($currency),
                                'value' => $amount,
                            ],
                        ],
                    ],
                    'application_context' => [
                        'return_url' => route('payment.success'),
                        'cancel_url' => route('checkout.index'),
                    ],
                ]);

            if ($response->status() === 201) {
                $data = $response->json();
                return [
                    'status' => 'initiated',
                    'gateway' => 'paypal',
                    'payment_id' => $data['id'],
                    'redirect_url' => collect($data['links'])->firstWhere('rel', 'approve')['href'] ?? null,
                ];
            }

            return [
                'status' => 'error',
                'message' => 'Failed to create PayPal order',
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
            $token = $this->getAccessToken();

            $response = Http::withToken($token)
                ->post($this->baseUrl . '/checkout/orders/' . $paymentId . '/capture');

            if ($response->status() === 201) {
                $data = $response->json();
                $capture = $data['purchase_units'][0]['payments']['captures'][0];

                return [
                    'status' => 'success',
                    'gateway' => 'paypal',
                    'payment_id' => $data['id'],
                    'capture_id' => $capture['id'],
                    'amount' => intval($capture['amount']['value'] * 100),
                    'currency' => $capture['amount']['currency_code'],
                ];
            }

            return [
                'status' => 'failed',
                'message' => $response->json('message') ?? 'Failed to capture payment',
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
            $token = $this->getAccessToken();
            $captureId = $paymentId;

            $body = [];
            if ($amountCents) {
                $body['amount'] = [
                    'currency_code' => 'USD',
                    'value' => number_format($amountCents / 100, 2, '.', ''),
                ];
            }

            $response = Http::withToken($token)
                ->post($this->baseUrl . '/payments/captures/' . $captureId . '/refund', $body);

            if ($response->status() === 201) {
                $data = $response->json();
                return [
                    'status' => 'success',
                    'gateway' => 'paypal',
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
        $event = $payload['event_type'] ?? null;
        $resource = $payload['resource'] ?? [];

        return match ($event) {
            'CHECKOUT.ORDER.COMPLETED' => [
                'status' => 'pending',
                'order_id' => $resource['reference_id'] ?? null,
                'payment_id' => $resource['id'],
            ],
            'PAYMENT.CAPTURE.COMPLETED' => [
                'status' => 'paid',
                'payment_id' => $resource['id'],
                'supplementary_data' => $resource['supplementary_data'] ?? [],
            ],
            'PAYMENT.CAPTURE.REFUNDED' => [
                'status' => 'refunded',
                'refund_id' => $resource['id'],
            ],
            default => ['status' => 'unhandled'],
        };
    }

    public function verifyWebhookSignature(string $signature, string $body): bool
    {
        return true;
    }

    public function getName(): string
    {
        return 'PayPal';
    }

    public function isConfigured(): bool
    {
        return (bool) config('services.paypal.client_id');
    }
}
