<?php

namespace App\Observers;

use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\InventoryLevel;
use App\Models\InventoryMovement;
use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
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

    /**
     * Draw the ordered quantities out of inventory.
     *
     * The single owner of stock deduction for the pending -> paid transition.
     * The observer sees every route to paid — the storefront confirmation, the
     * gateway webhook, and an admin changing the status by hand — where the
     * payment controller only saw its own two. It previously deducted a second
     * time on top of the controller, drawing double for every storefront order.
     *
     * Levels are drained warehouse by warehouse under a row lock, fullest
     * first, and every draw is written to inventory_movements.
     */
    private function deductInventory(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $remaining = (int) $item->quantity;

            $levels = InventoryLevel::where('product_variant_id', $item->product_variant_id)
                ->where('quantity', '>', 0)
                ->lockForUpdate()
                ->orderByDesc('quantity')
                ->get();

            foreach ($levels as $level) {
                if ($remaining <= 0) {
                    break;
                }

                $take = min($remaining, (int) $level->quantity);
                $level->decrement('quantity', $take);
                $remaining -= $take;

                InventoryMovement::create([
                    'product_variant_id' => $item->product_variant_id,
                    'warehouse_id' => $level->warehouse_id,
                    'type' => 'sale',
                    'quantity' => -$take,
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'performed_by' => auth()->id(),
                    'note' => "Order #{$order->order_number}",
                    'occurred_at' => now(),
                ]);
            }

            if ($remaining > 0) {
                Log::warning('Order paid with insufficient stock on hand', [
                    'order_id' => $order->id,
                    'variant_id' => $item->product_variant_id,
                    'short_by' => $remaining,
                ]);
            }
        }
    }
}
