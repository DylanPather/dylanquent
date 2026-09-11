<?php

use App\Enums\OrderStatus;
use App\Mail\OrderConfirmation;
use App\Mail\OrderShipped;
use App\Mail\PaymentFailed;
use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

/**
 * A pending order owned by a signed-in user's customer record.
 *
 * @return array{0: User, 1: Customer, 2: Order}
 */
function mailableOrder(array $orderAttributes = []): array
{
    $user = User::factory()->create();
    $customer = Customer::create([
        'user_id' => $user->id,
        'name' => 'Thandi Mokoena',
        'email' => 'thandi@example.com',
    ]);

    $order = Order::create(array_merge([
        'order_number' => 'ORD-'.fake()->unique()->numerify('#####'),
        'customer_id' => $customer->id,
        'status' => 'pending',
        'payment_status' => 'pending',
        'payment_gateway' => 'stripe',
        'subtotal_cents' => 4500,
        'total_cents' => 4500,
        'currency' => 'ZAR',
        'placed_at' => now(),
    ], $orderAttributes));

    return [$user, $customer, $order];
}

it('sends the order confirmation to the customer on the paid transition', function () {
    Mail::fake();
    [, $customer, $order] = mailableOrder();

    $order->update(['status' => 'paid']);

    Mail::assertSent(OrderConfirmation::class, fn ($mail) => $mail->hasTo($customer->email));
});

it('confirms a payment without erroring on the confirmation email', function () {
    // A real transport on purpose. Mail::fake() never builds the message, so
    // it hides the missing "To" header that made this endpoint 500; the array
    // transport builds and keeps it, exactly like a real send would.
    config(['mail.default' => 'array']);

    [$user, $customer, $order] = mailableOrder();
    fakePaymentGateway(['confirm' => [
        'status' => 'success',
        'payment_id' => 'pi_test_123',
        'amount' => 4500,
        'currency' => 'ZAR',
    ]]);

    // Previously 500'd: the mailable carried no recipient, so the observer
    // threw inside the confirmation transaction after the customer had paid.
    $this->actingAs($user)
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_test_123'])
        ->assertOk()
        ->assertJson(['status' => 'success']);

    expect($order->fresh()->status)->toBe(OrderStatus::Paid);

    $sent = app('mailer')->getSymfonyTransport()->messages();

    expect($sent)->toHaveCount(1)
        ->and($sent[0]->getOriginalMessage()->getTo()[0]->getAddress())->toBe($customer->email);
});

it('sends the shipped notice to the customer', function () {
    Mail::fake();
    [, $customer, $order] = mailableOrder(['status' => 'paid']);

    $order->update(['status' => 'fulfilled']);

    Mail::assertSent(OrderShipped::class, fn ($mail) => $mail->hasTo($customer->email));
});

it('addresses every customer-facing mailable to the customer', function () {
    [, $customer, $order] = mailableOrder();

    expect((new OrderConfirmation($order))->hasTo($customer->email))->toBeTrue()
        ->and((new OrderShipped($order))->hasTo($customer->email))->toBeTrue()
        ->and((new PaymentFailed($order, 'Card declined'))->hasTo($customer->email))->toBeTrue();
});

it('skips the confirmation when the order has no customer to write to', function () {
    Mail::fake();
    [, , $order] = mailableOrder();
    $order->customer->delete();          // customer_id nulls on delete
    $order->refresh()->load('customer');

    $order->update(['status' => 'paid']);

    Mail::assertNothingSent();
    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
});
