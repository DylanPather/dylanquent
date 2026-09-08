<?php

namespace App\Http\Controllers\Storefront;

use App\Models\Order;
use App\Services\PaymentGateway\PaymentProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        if (!$orderId) {
            return redirect()->route('checkout.index')->with('error', 'No order found');
        }

        $order = Order::find($orderId);

        if (!$order || $order->customer_id !== auth('customer')->id()) {
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

        if (!$order || $order->customer_id !== auth('customer')->id()) {
            return response()->json(['error' => 'Invalid order'], 403);
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

        if (!$order || $order->customer_id !== auth('customer')->id()) {
            return response()->json(['error' => 'Invalid order'], 403);
        }

        try {
            $gateway = $this->processor->gateway($order->payment_gateway);
            $result = $gateway->confirm($validated['payment_id']);

            if ($result['status'] === 'success') {
                DB::transaction(function () use ($order, $result) {
                    $order->update([
                        'payment_id' => $result['payment_id'],
                        'payment_status' => 'paid',
                        'status' => 'paid',
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

            $order->update(['payment_status' => 'failed']);
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

            if (!$processor->verifyWebhookSignature($signature, $request->getContent())) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $result = $processor->handleWebhook($payload);

            if ($result['status'] !== 'unhandled' && isset($result['order_id'])) {
                $order = Order::find($result['order_id']);

                if ($order) {
                    DB::transaction(function () use ($order, $result) {
                        $order->update([
                            'payment_status' => $result['status'],
                            'status' => $result['status'] === 'paid' ? 'paid' : $order->status,
                        ]);

                        if ($result['status'] === 'failed') {
                            event(new \App\Events\PaymentFailed($order, $result['reason'] ?? 'Unknown'));
                        }
                    });
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error("Webhook error for gateway {$gateway}: " . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
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
