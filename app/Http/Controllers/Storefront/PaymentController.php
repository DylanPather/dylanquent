<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\PaymentGateway\PaymentProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController
{
    public function __construct(private PaymentProcessor $processor) {}

    /**
     * Show payment page with gateway selection
     */
    public function show(Request $request)
    {
        $orderId = session('order_id');

        if (! $orderId) {
            return redirect()->route('checkout.index')->with('error', 'No order found');
        }

        $order = Order::find($orderId);

        if (! $order || $order->customer_id !== auth('customer')->id()) {
            return redirect()->route('checkout.index')->with('error', 'Invalid order');
        }

        $gateways = $this->processor->availableGateways();
        $defaultGateway = $this->processor->getDefaultGateway($request->ip());

        return Inertia::render('checkout/payment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_cents' => $order->total_cents,
                'currency' => $order->currency,
            ],
            'gateways' => $gateways,
            'defaultGateway' => $defaultGateway,
        ]);
    }

    /**
     * Initiate payment with selected gateway
     */
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'gateway' => 'required|string',
            'order_id' => 'required|integer',
        ]);

        $order = Order::find($validated['order_id']);

        // There is no 'customer' auth guard — only 'web'. This previously
        // threw InvalidArgumentException on every call, so no payment could
        // ever be confirmed.
        $customerId = auth()->user()?->customer?->id;

        if (! $order || ! $customerId || $order->customer_id !== $customerId) {
            return response()->json(['error' => 'Invalid order'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'status' => 'success',
                'redirect' => route('checkout.success', $order->order_number),
            ]);
        }

        try {
            $gateway = $this->processor->gateway($validated['gateway']);

            $result = $gateway->initiate(
                $order->total_cents,
                $order->currency,
                (string) $order->id,
                ['order_number' => $order->order_number]
            );

            if ($result['status'] === 'error') {
                return response()->json($result, 422);
            }

            $order->update([
                'payment_gateway' => $validated['gateway'],
                'payment_id' => $result['payment_id'],
                'payment_status' => 'initiated',
            ]);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Confirm payment after client-side processing
     */
    public function confirm(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer',
            'payment_id' => 'required|string',
        ]);

        $order = Order::find($validated['order_id']);

        // There is no 'customer' auth guard — only 'web'. This previously
        // threw InvalidArgumentException on every call, so no payment could
        // ever be confirmed.
        $customerId = auth()->user()?->customer?->id;

        if (! $order || ! $customerId || $order->customer_id !== $customerId) {
            return response()->json(['error' => 'Invalid order'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'status' => 'success',
                'redirect' => route('checkout.success', $order->order_number),
            ]);
        }

        try {
            $gateway = $this->processor->gateway($order->payment_gateway);
            $result = $gateway->confirm($validated['payment_id']);

            if ($result['status'] === 'success') {
                // Verify the gateway actually captured what this order costs.
                // Without this, any succeeded payment id could mark any order
                // paid, whatever was really charged.
                $paidAmount = (int) ($result['amount'] ?? 0);
                $paidCurrency = strtoupper((string) ($result['currency'] ?? ''));

                if ($paidAmount !== (int) $order->total_cents || $paidCurrency !== strtoupper($order->currency)) {
                    Log::warning('Payment amount mismatch', [
                        'order_id' => $order->id,
                        'expected' => $order->total_cents.' '.$order->currency,
                        'received' => $paidAmount.' '.$paidCurrency,
                    ]);

                    $order->update([
                        'payment_status' => 'failed',
                        'status' => OrderStatus::PaymentFailed,
                        'payment_failure_reason' => 'The amount captured did not match the order total.',
                    ]);

                    return response()->json([
                        'status' => 'failed',
                        'message' => 'Payment amount did not match the order total.',
                    ], 422);
                }

                DB::transaction(function () use ($order, $result) {
                    // OrderObserver draws the stock off the pending -> paid
                    // transition, so this update is the whole job.
                    $order->update([
                        'payment_id' => $result['payment_id'],
                        'payment_status' => 'paid',
                        'status' => OrderStatus::Paid,
                        'payment_failure_reason' => null,
                    ]);
                });

                session()->forget(['order_id', 'cart']);

                return response()->json([
                    'status' => 'success',
                    'redirect' => route('checkout.success', $order->order_number),
                ]);
            }

            if ($result['status'] === 'processing') {
                $order->update(['payment_status' => 'processing']);

                return response()->json($result);
            }

            // The status moves too, not just payment_status: OrderObserver
            // watches orders.status, and this is what puts the "payment
            // failed" email in front of the customer.
            $order->update([
                'payment_status' => 'failed',
                'status' => OrderStatus::PaymentFailed,
                'payment_failure_reason' => $result['message'] ?? null,
            ]);

            return response()->json($result, 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle webhook from payment gateway
     */
    public function webhook(Request $request, string $gateway)
    {
        try {
            $payload = $request->all();
            $signature = $request->header('Stripe-Signature') ?? $request->header('X-Osow-Signature') ?? '';

            $processor = $this->processor->gateway($gateway);

            if (! $processor->verifyWebhookSignature($signature, $request->getContent())) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $result = $processor->handleWebhook($payload);

            if ($result['status'] !== 'unhandled' && isset($result['order_id'])) {
                $order = Order::find($result['order_id']);

                if ($order) {
                    DB::transaction(function () use ($order, $result) {
                        // Gateways retry webhooks. OrderObserver draws stock off
                        // the pending -> paid transition, so a replay that finds
                        // the order already paid moves no stock.
                        $attributes = [
                            'payment_status' => $result['status'],
                            'status' => $this->orderStatusFor($result['status'], $order),
                        ];

                        // A failure used to dispatch App\Events\PaymentFailed,
                        // a class that does not exist and that nothing listened
                        // for: the dispatch fatalled, the catch below turned it
                        // into a 500, and the gateway retried a webhook that
                        // could never succeed. The status carries it now, and
                        // OrderObserver sends the mail.
                        if ($result['status'] === 'failed') {
                            $attributes['payment_failure_reason'] = $result['reason'] ?? null;
                        }

                        $order->update($attributes);
                    });
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error("Webhook error for gateway {$gateway}: ".$e->getMessage());

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * The order status a gateway payment status puts the order into.
     *
     * Only 'paid' and 'failed' say anything about the order itself; anything
     * else the gateway reports is a payment detail and leaves it alone.
     */
    private function orderStatusFor(string $paymentStatus, Order $order): OrderStatus
    {
        return match ($paymentStatus) {
            'paid' => OrderStatus::Paid,
            'failed' => OrderStatus::PaymentFailed,
            default => $order->status,
        };
    }

    /**
     * Success page after payment
     */
    public function success(Request $request)
    {
        $orderNumber = $request->route('order_number');
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if (auth('customer')->check() && $order->customer_id !== auth('customer')->id()) {
            return redirect()->route('welcome');
        }

        return Inertia::render('checkout/success', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_cents' => $order->total_cents,
                'currency' => $order->currency,
                'status' => $order->status,
                'customer_email' => $order->customer->email,
            ],
        ]);
    }
}
