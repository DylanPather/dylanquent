<?php

use App\Enums\OrderStatus;
use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

/**
 * A pending order owned by a signed-in user's customer record.
 *
 * @return array{0: User, 1: Customer, 2: Order}
 */
function payableOrder(array $orderAttributes = []): array
{
    $user = User::factory()->create();
    $customer = Customer::create([
        'user_id' => $user->id,
        'name' => 'Sipho Dlamini',
        'email' => fake()->unique()->safeEmail(),
    ]);

    $order = Order::create(array_merge([
        'order_number' => 'ORD-'.fake()->unique()->numerify('#####'),
        'customer_id' => $customer->id,
        'status' => OrderStatus::Pending,
        'payment_status' => 'pending',
        'payment_gateway' => 'stripe',
        'subtotal_cents' => 4500,
        'total_cents' => 4500,
        'currency' => 'ZAR',
        'placed_at' => now(),
    ], $orderAttributes));

    return [$user, $customer, $order];
}

/** Messages the array transport actually built, headers and all. */
function sentMessages(): Collection
{
    return app('mailer')->getSymfonyTransport()->messages();
}

// ---------------------------------------------------------------------------
// The vocabulary and the column
// ---------------------------------------------------------------------------

it('stores every status in the enum', function () {
    // The column used to be a database enum listing six values by hand, two
    // of which the code never wrote and two of which it wrote without the
    // column allowing them. This is what keeps the two ends together.
    foreach (OrderStatus::cases() as $status) {
        $order = Order::create([
            'order_number' => 'ORD-'.$status->value,
            'status' => $status,
            'payment_status' => 'pending',
            'total_cents' => 1000,
            'currency' => 'ZAR',
        ]);

        expect($order->fresh()->status)->toBe($status);
    }
});

it('refuses to write a status outside the enum', function () {
    [, , $order] = payableOrder();

    // 'shipped' is the exact value the shipping label controller used to
    // write. It now fails in PHP, with the offending value in the message,
    // rather than as a constraint violation from the database.
    expect(fn () => $order->update(['status' => 'shipped']))->toThrow(ValueError::class);

    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

it('offers exactly the enum as the admin filter list', function () {
    fakePaymentGateway();

    $this->actingAs(User::factory()->create())
        ->get('/sales/orders')
        ->assertInertia(fn ($page) => $page
            ->where('statuses', OrderStatus::values()));
});

it('filters by a status the admin list offers but validation used to reject', function () {
    fakePaymentGateway();
    [, , $order] = payableOrder(['status' => OrderStatus::PartiallyRefunded]);
    payableOrder(['status' => OrderStatus::Pending]);

    $this->actingAs(User::factory()->create())
        ->get('/sales/orders?status=partially_refunded')
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.order_number', $order->order_number));
});

// ---------------------------------------------------------------------------
// The admin status form
// ---------------------------------------------------------------------------

it('accepts every status from the admin status form', function () {
    Mail::fake();
    fakePaymentGateway();
    $admin = User::factory()->create();
    [, , $order] = payableOrder();

    foreach (OrderStatus::cases() as $status) {
        $this->actingAs($admin)
            ->post("/sales/orders/{$order->id}/status", ['status' => $status->value])
            ->assertSessionHasNoErrors();

        expect($order->fresh()->status)->toBe($status);
    }
});

it('rejects a status the column cannot hold', function () {
    fakePaymentGateway();
    [, , $order] = payableOrder();

    // Both were in the old validation list and neither was a real status:
    // picking either from the admin form produced a database error.
    foreach (['shipped', 'delivered'] as $unknown) {
        $this->actingAs(User::factory()->create())
            ->from("/sales/orders/{$order->id}")
            ->post("/sales/orders/{$order->id}/status", ['status' => $unknown])
            ->assertSessionHasErrors('status');
    }

    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

// ---------------------------------------------------------------------------
// Transitions that could not happen before
// ---------------------------------------------------------------------------

it('tells the customer when their payment fails', function () {
    Mail::fake();
    [, $customer, $order] = payableOrder();

    // 'payment_failed' was not a value the column accepted, so the observer
    // branch that sends this mail was unreachable from a status write.
    $order->update([
        'status' => OrderStatus::PaymentFailed,
        'payment_failure_reason' => 'Card declined by issuer.',
    ]);

    Mail::assertSent(PaymentFailed::class, fn ($mail) => $mail->hasTo($customer->email)
        && $mail->reason === 'Card declined by issuer.'
        && $mail->order->is($order));
});

it('does not put the admin notes in the customer email', function () {
    Mail::fake();
    [, , $order] = payableOrder(['notes' => 'Chargeback risk — do not refund.']);

    // The reason used to be read from the previous value of 'notes', which is
    // the admin's own field.
    $order->update(['status' => OrderStatus::PaymentFailed]);

    Mail::assertSent(PaymentFailed::class, fn ($mail) => ! str_contains($mail->reason, 'Chargeback'));
});

it('fails the order and writes to the customer when the gateway declines', function () {
    // A real transport: Mail::fake() never builds the message, so it would
    // hide a mailable that resolves to no recipient.
    config(['mail.default' => 'array']);

    [$user, $customer, $order] = payableOrder();
    fakePaymentGateway(['confirm' => ['status' => 'failed', 'message' => 'Insufficient funds.']]);

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_1'])
        ->assertStatus(422);

    expect($order->fresh()->status)->toBe(OrderStatus::PaymentFailed)
        ->and($order->fresh()->payment_status)->toBe('failed')
        ->and($order->fresh()->payment_failure_reason)->toBe('Insufficient funds.');

    $sent = sentMessages();

    expect($sent)->toHaveCount(1)
        ->and($sent[0]->getOriginalMessage()->getTo()[0]->getAddress())->toBe($customer->email);
});

it('fails the order when the gateway captured the wrong amount', function () {
    Mail::fake();
    [$user, , $order] = payableOrder();

    // Succeeded, but for R10 against a R45 order.
    fakePaymentGateway(['confirm' => [
        'status' => 'success', 'payment_id' => 'pi_1', 'amount' => 1000, 'currency' => 'ZAR',
    ]]);

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_1'])
        ->assertStatus(422);

    expect($order->fresh()->status)->toBe(OrderStatus::PaymentFailed);

    Mail::assertSent(PaymentFailed::class);
    Mail::assertNotSent(OrderConfirmation::class);
});

it('handles a failed payment webhook instead of erroring on it', function () {
    config(['mail.default' => 'array']);

    [, $customer, $order] = payableOrder();
    fakePaymentGateway(['webhook' => ['status' => 'failed', 'reason' => 'Card reported stolen.']]);

    // This used to dispatch App\Events\PaymentFailed, a class that does not
    // exist: the fatal became a 500, and the gateway retried forever.
    $this->postJson('/webhooks/payment/stripe', ['order_id' => $order->id])
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($order->fresh()->status)->toBe(OrderStatus::PaymentFailed)
        ->and($order->fresh()->payment_failure_reason)->toBe('Card reported stolen.');

    $sent = sentMessages();

    expect($sent)->toHaveCount(1)
        ->and($sent[0]->getOriginalMessage()->getTo()[0]->getAddress())->toBe($customer->email);
});

it('confirms the order when a customer retries a failed payment', function () {
    Mail::fake();
    [, $customer, $order] = payableOrder(['status' => OrderStatus::PaymentFailed]);

    $order->update(['status' => OrderStatus::Paid]);

    // Only pending -> paid used to send this, and pending was the only status
    // an unpaid order could be in. A retry is still the first confirmation
    // the customer sees.
    Mail::assertSent(OrderConfirmation::class, fn ($mail) => $mail->hasTo($customer->email));
});

it('sends the shipped notice once per shipment', function () {
    Mail::fake();
    [, , $order] = payableOrder(['status' => OrderStatus::Paid]);

    $order->update(['status' => OrderStatus::Fulfilled]);
    $order->update(['tracking_number' => 'TRK-123']);

    // 'fulfilled' and 'shipped' were both watched for and treated as
    // different statuses, so an order that passed through both wrote to the
    // customer twice about one parcel.
    Mail::assertSent(OrderShipped::class, 1);
});

it('marks the order fulfilled when a shipping label is printed', function () {
    Mail::fake();
    [, , $order] = payableOrder(['status' => OrderStatus::Paid]);

    // Wrote 'shipped' before, which the column rejected outright.
    $this->actingAs(User::factory()->create())
        ->post("/fulfillment/labels/{$order->id}", [
            'carrier' => 'DHL',
            'service_type' => 'Express',
            'weight_oz' => 12.5,
            'tracking_number' => 'DHL-0001',
            'cost' => 149.99,
        ])
        ->assertRedirect(route('fulfillment.shipping-labels.index'));

    expect($order->fresh()->status)->toBe(OrderStatus::Fulfilled);
    Mail::assertSent(OrderShipped::class, 1);
});

it('leaves the order status alone for a payment status it says nothing about', function () {
    Mail::fake();
    [, , $order] = payableOrder(['status' => OrderStatus::Paid]);
    fakePaymentGateway(['webhook' => ['status' => 'pending']]);

    $this->postJson('/webhooks/payment/stripe', ['order_id' => $order->id])->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::Paid)
        ->and($order->fresh()->payment_status)->toBe('pending');
});

it('keeps no stale failure reason on an order that goes on to pay', function () {
    Mail::fake();
    [$user, , $order] = payableOrder([
        'status' => OrderStatus::PaymentFailed,
        'payment_failure_reason' => 'Card declined by issuer.',
    ]);
    fakePaymentGateway();

    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_1'])
        ->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::Paid)
        ->and($order->fresh()->payment_failure_reason)->toBeNull();
});

it('drops the database constraint that kept the new statuses out', function () {
    // Belt and braces on the migration itself: the column takes the values
    // straight, with no model in the way. Postgres keeps a column's CHECK
    // across a type change, so this is what proves it was removed.
    foreach (OrderStatus::values() as $value) {
        DB::table('orders')->insert([
            'order_number' => 'RAW-'.$value,
            'status' => $value,
            'payment_status' => 'pending',
            'total_cents' => 1000,
            'currency' => 'ZAR',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    expect(DB::table('orders')->count())->toBe(count(OrderStatus::values()));
});
