<?php

namespace App\Observers;

use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class OrderObserver
{
    public function updated(Order $order)
    {
        $originalStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        if ($originalStatus === 'pending' && $newStatus === 'paid') {
            Mail::send(new OrderConfirmation($order));
        }

        if (in_array($newStatus, ['fulfilled', 'shipped']) && $originalStatus !== $newStatus) {
            Mail::send(new OrderShipped($order));
        }

        if ($newStatus === 'payment_failed') {
            $reason = $order->getOriginal('notes') ?? 'Payment processing failed.';
            Mail::send(new PaymentFailed($order, $reason));
        }
    }
}
