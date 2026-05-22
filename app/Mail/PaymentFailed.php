<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $reason = 'Your payment could not be processed.'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment Failed for Order #{$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-failed',
            with: [
                'order' => $this->order,
                'reason' => $this->reason,
                'customer' => $this->order->customer,
                'amount' => number_format($this->order->total_cents / 100, 2),
                'currency' => $this->order->currency,
                'retryUrl' => route('payment.show'),
            ],
        );
    }
}
