<?php

use App\Models\Customer;
use App\Models\InventoryLevel;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function shopFixture(int $stock = 10, int $priceCents = 4500): array
{
    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE',
        'price_cents' => $priceCents, 'currency' => 'ZAR', 'is_active' => true,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'M', 'sku' => 'DQ-TEE-M',
        'price_cents' => $priceCents, 'track_inventory' => true, 'is_active' => true,
    ]);
    $warehouse = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create([
        'product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id, 'quantity' => $stock,
    ]);

    return [$product, $variant];
}

it('creates orders in the store currency, not USD', function () {
    [$product, $variant] = shopFixture();
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd', 'city' => 'Johannesburg'],
        'billing_address' => ['line1' => '1 Main Rd', 'city' => 'Johannesburg'],
    ])->assertRedirect();

    expect(Order::first())->currency->toBe('ZAR');
});

it('prices the order from the database, not the cart snapshot', function () {
    [$product, $variant] = shopFixture(10, 4500);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2]);

    // Price rises after the item is already sitting in the cart.
    $variant->update(['price_cents' => 9900]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ]);

    expect(Order::first()->total_cents)->toBe(19800);
});

it('refuses checkout when stock ran out after adding to cart', function () {
    [$product, $variant] = shopFixture(5);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 5]);

    InventoryLevel::where('product_variant_id', $variant->id)->update(['quantity' => 1]);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['line1' => '1 Main Rd'],
        'billing_address' => ['line1' => '1 Main Rd'],
    ])->assertSessionHasErrors('cart');

    expect(Order::count())->toBe(0);
});

it('rejects confirming an order that belongs to someone else', function () {
    [$product, $variant] = shopFixture();
    $owner = Customer::create(['name' => 'Owner', 'email' => 'owner@example.com']);
    $order = Order::create([
        'order_number' => 'ORD-X', 'customer_id' => $owner->id, 'status' => 'pending',
        'payment_status' => 'pending', 'subtotal_cents' => 4500, 'total_cents' => 4500,
        'currency' => 'ZAR', 'payment_gateway' => 'stripe',
    ]);

    // Previously threw InvalidArgumentException: guard [customer] is not defined.
    $this->actingAs(User::factory()->create())
        ->postJson('/payment/confirm', ['order_id' => $order->id, 'payment_id' => 'pi_test'])
        ->assertStatus(403);
});
