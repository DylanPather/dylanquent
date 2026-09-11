<?php

namespace App\Mail\Concerns;

use Illuminate\Mail\Mailables\Address;

trait AddressesTheCustomer
{
    /**
     * The order's customer as an envelope recipient list.
     *
     * Every customer-facing mailable needs this: a mailable built without a
     * "To" header throws when it is sent, which turned a successful payment
     * into a 500 for the customer.
     *
     * An order can outlive its customer — orders.customer_id is nullable and
     * nulls on delete — so this returns an empty list rather than fataling
     * when there is nobody left to write to.
     *
     * @return array<int, Address>
     */
    protected function customerRecipients(): array
    {
        $customer = $this->order->customer;

        if (! $customer || ! $customer->email) {
            return [];
        }

        return [new Address($customer->email, $customer->name)];
    }
}
