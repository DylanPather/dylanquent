<?php

namespace App\Observers;

use App\Enums\OrderStatus;
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
        $previous = $order->getOriginal('status');
        $current = $order->status;

        // updated() fires for every write, most of which leave the status
        // alone — a tracking number, an admin note. Only a move between
        // statuses is worth telling the customer about.
        if ($previous === $current) {
            return;
        }

        // Not just pending -> paid: an order whose payment failed and was
        // retried successfully is still the customer's first confirmation,
        // and its stock still has to come off the shelf.
        if ($previous?->isAwaitingPayment() && $current === OrderStatus::Paid) {
            $this->mailCustomer($order, new OrderConfirmation($order));
            $this->deductInventory($order);
        }

        if ($current === OrderStatus::Fulfilled) {
            $this->mailCustomer($order, new OrderShipped($order));
        }

        if ($current === OrderStatus::PaymentFailed) {
            // Whatever the gateway said, when it said anything. Reading the
            // reason off the order rather than the previous note keeps the
            // admin's own notes out of a customer-facing email.
            $reason = $order->payment_failure_reason;

            $this->mailCustomer($order, $reason === null
                ? new PaymentFailed($order)
                : new PaymentFailed($order, $reason));
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
