<?php

namespace App\Mail;

use App\Mail\Concerns\AddressesTheCustomer;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use AddressesTheCustomer, Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->customerRecipients(),
            subject: "Your Order #{$this->order->order_number} Has Shipped",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-shipped',
            with: [
                'order' => $this->order,
                'trackingNumber' => $this->order->tracking_number,
                'customer' => $this->order->customer,
            ],
        );
    }
}
