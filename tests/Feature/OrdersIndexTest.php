<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function admin(): User
{
    return User::factory()->create();
}

function makeOrder(array $attrs = []): Order
{
    return Order::create(array_merge([
        'order_number' => 'DQ-'.fake()->unique()->numerify('#####'),
        'status' => 'pending',
        'payment_status' => 'pending',
        'subtotal_cents' => 10000,
        'total_cents' => 10000,
        'currency' => 'ZAR',
    ], $attrs));
}

it('filters orders by status', function () {
    makeOrder(['status' => 'pending']);
    makeOrder(['status' => 'paid']);

    $this->actingAs(admin())
        ->get('/sales/orders?status=paid')
        ->assertInertia(fn ($p) => $p->has('orders.data', 1)->where('orders.data.0.status', 'paid'));
});

it('searches by order number', function () {
    makeOrder(['order_number' => 'DQ-ALPHA']);
    makeOrder(['order_number' => 'DQ-BETA']);

    $this->actingAs(admin())
        ->get('/sales/orders?search=ALPHA')
        ->assertInertia(fn ($p) => $p->has('orders.data', 1)->where('orders.data.0.order_number', 'DQ-ALPHA'));
});

it('searches by customer email', function () {
    $customer = Customer::create(['name' => 'Jo Smith', 'email' => 'jo@example.com']);
    makeOrder(['customer_id' => $customer->id, 'order_number' => 'DQ-WITHCUST']);
    makeOrder(['order_number' => 'DQ-NOCUST']);

    $this->actingAs(admin())
        ->get('/sales/orders?search=jo@example.com')
        ->assertInertia(fn ($p) => $p->has('orders.data', 1)->where('orders.data.0.order_number', 'DQ-WITHCUST'));
});

it('reports revenue from paid orders only', function () {
    makeOrder(['payment_status' => 'paid', 'total_cents' => 5000]);
    makeOrder(['payment_status' => 'pending', 'total_cents' => 9900]);

    $this->actingAs(admin())
        ->get('/sales/orders')
        ->assertInertia(fn ($p) => $p->where('stats.revenue_cents', 5000)->where('stats.awaiting_payment', 1));
});
