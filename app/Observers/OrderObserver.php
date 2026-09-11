<?php

namespace App\Observers;

use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

class OrderObserver
{
    public function updated(Order $order)
    {
        $originalStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        if ($originalStatus === 'pending' && $newStatus === 'paid') {
            $this->mailCustomer($order, new OrderConfirmation($order));
            $this->deductInventory($order);
        }

        if (in_array($newStatus, ['fulfilled', 'shipped']) && $originalStatus !== $newStatus) {
            $this->mailCustomer($order, new OrderShipped($order));
        }

        if ($newStatus === 'payment_failed') {
            $reason = $order->getOriginal('notes') ?? 'Payment processing failed.';
            $this->mailCustomer($order, new PaymentFailed($order, $reason));
        }
    }

    /**
     * Send a customer-facing mailable for this order.
     *
     * orders.customer_id is nullable, and sending a mailable that resolves to
     * no recipient throws. These sends run inside the payment confirmation
     * transaction, so anything thrown here surfaces to the customer as a 500
     * on a payment that actually succeeded — skip instead.
     */
    private function mailCustomer(Order $order, Mailable $mailable): void
    {
        if (! $order->customer?->email) {
            return;
        }

        Mail::send($mailable);
    }

    private function deductInventory(Order $order): void
    {
        $warehouse = \App\Models\Warehouse::where('is_active', true)->first();
        if (!$warehouse) {
            return;
        }

        foreach ($order->items as $item) {
            if (!$item->product_variant_id) {
                continue;
            }

            $inventoryLevel = InventoryLevel::where('product_variant_id', $item->product_variant_id)
                ->where('warehouse_id', $warehouse->id)
                ->first();

            if ($inventoryLevel) {
                $inventoryLevel->decrement('quantity', $item->quantity);

                InventoryMovement::create([
                    'product_variant_id' => $item->product_variant_id,
                    'warehouse_id' => $warehouse->id,
                    'type' => 'sale',
                    'quantity' => -$item->quantity,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'performed_by' => auth()->id(),
                    'note' => "Order #{$order->order_number}",
                    'occurred_at' => now(),
                ]);
            }
        }
    }
}
