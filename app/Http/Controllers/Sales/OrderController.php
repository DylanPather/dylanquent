<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentGateway\PaymentProcessor;
use App\Services\ShippingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private PaymentProcessor $paymentProcessor,
        private ShippingService $shippingService
    ) {}

    public function index(): Response
    {
        $orders = Order::query()->latest()->paginate(15)->through(fn (Order $o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'status' => $o->status,
            'total_cents' => $o->total_cents,
            'currency' => $o->currency,
            'placed_at' => $o->placed_at?->toDateTimeString(),
            'customer_email' => $o->customer?->email,
        ]);

        return Inertia::render('sales/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('sales/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'subtotal_cents' => $order->subtotal_cents,
                'discount_total_cents' => $order->discount_total_cents,
                'tax_total_cents' => $order->tax_total_cents,
                'shipping_total_cents' => $order->shipping_total_cents,
                'total_cents' => $order->total_cents,
                'currency' => $order->currency,
                'payment_gateway' => $order->payment_gateway,
                'payment_status' => $order->payment_status,
                'payment_id' => $order->payment_id,
                'tracking_number' => $order->tracking_number,
                'placed_at' => $order->placed_at?->toDateTimeString(),
                'shipped_at' => $order->shipped_at?->toDateTimeString(),
                'updated_at' => $order->updated_at?->toDateTimeString(),
                'notes' => $order->notes,
                'customer' => [
                    'id' => $order->customer->id,
                    'name' => $order->customer->name,
                    'email' => $order->customer->email,
                    'phone' => $order->customer->phone,
                ],
                'billing_address' => $order->billing_address,
                'shipping_address' => $order->shipping_address,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->name,
                    'quantity' => $item->quantity,
                    'unit_price_cents' => $item->unit_price_cents,
                    'total_cents' => $item->total_cents,
                ]),
            ],
            'availableStatuses' => ['pending', 'paid', 'processing', 'fulfilled', 'shipped', 'cancelled', 'refunded'],
            'availableCarriers' => $this->shippingService->getCarriers(),
        ]);
    }

    public function markAsShipped(Request $request, Order $order)
    {
        $validated = $request->validate([
            'carrier' => 'nullable|string',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $this->shippingService->markAsShipped(
            $order,
            $validated['carrier'] ?? 'usps',
            $validated['tracking_number']
        );

        return back()->with('message', 'Order marked as shipped');
    }

    public function refund(Request $request, Order $order)
    {
        if ($order->payment_status !== 'paid') {
            return back()->with('error', 'Only paid orders can be refunded');
        }

        try {
            $gateway = $this->paymentProcessor->gateway($order->payment_gateway);
            $result = $gateway->refund($order->payment_id);

            if ($result['status'] === 'success') {
                $order->update([
                    'status' => 'refunded',
                    'payment_status' => 'refunded',
                ]);

                return back()->with('message', 'Refund processed successfully');
            }

            return back()->with('error', $result['message'] ?? 'Refund failed');
        } catch (\Exception $e) {
            return back()->with('error', 'Refund error: ' . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,paid,processing,fulfilled,shipped,cancelled,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? $order->notes,
        ]);

        return back()->with('message', 'Order status updated');
    }
}

