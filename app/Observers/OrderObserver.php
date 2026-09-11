<?php

namespace App\Observers;

use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\Order;
use App\Services\Inventory\StockLedger;
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

    /**
     * Draw the ordered quantities out of inventory.
     *
     * The observer is the single owner of this: it sees every route to paid —
     * the storefront confirmation, the gateway webhook, and an admin changing
     * the status by hand — where the payment controller only saw its own two.
     * Deduction itself belongs to StockLedger, which refuses to draw twice for
     * the same order however many times it is called.
     */
    private function deductInventory(Order $order): void
    {
        app(StockLedger::class)->sell($order);
    }
}
