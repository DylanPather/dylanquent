<?php

use App\Models\InventoryLevel;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

function basket(User $user): void
{
    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE',
        'price_cents' => 4500, 'currency' => 'ZAR', 'is_active' => true,
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'M', 'sku' => 'DQ-TEE-M',
        'price_cents' => 4500, 'track_inventory' => true, 'is_active' => true,
    ]);
    $warehouse = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create(['product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id, 'quantity' => 20]);

    test()->actingAs($user)->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1,
    ]);
}

function fakeLiveRates(): void
{
    config(['store.shipping.bobgo.enabled' => true, 'store.shipping.bobgo.token' => 'test-key']);
    Http::fake(['*/rates' => Http::response(['provider_rate_requests' => [
        ['provider_slug' => 'tcg', 'provider_name' => 'The Courier Guy', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 114.10, 'service_level' => ['name' => 'Economy', 'delivery_type' => 'door']],
        ]],
        ['provider_slug' => 'pudo', 'provider_name' => 'PUDO', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 65.50, 'service_level' => ['name' => 'Locker', 'delivery_type' => 'locker']],
        ]],
    ]])]);
}

it('quotes nothing until a postal code is given', function () {
    $user = User::factory()->create();
    basket($user);

    $this->actingAs($user)->get('/checkout')
        ->assertInertia(fn ($p) => $p->has('shippingRates', 0));
});

it('returns live courier rates for a postal code', function () {
    fakeLiveRates();
    $user = User::factory()->create();
    basket($user);

    $this->actingAs($user)->get('/checkout?postal_code=8001')
        ->assertInertia(fn ($p) => $p
            ->has('shippingRates', 2)
            ->where('shippingRates.0.cents', 6550)      // cheapest first
            ->where('shippingTotals.locker.total_cents', 11050)   // 4500 + 6550
            ->where('shippingTotals.door.total_cents', 15910));   // 4500 + 11410
});

it('charges the live rate the customer selected', function () {
    fakeLiveRates();
    $user = User::factory()->create();
    basket($user);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['address' => '1 Main Rd', 'city' => 'Cape Town', 'postal_code' => '8001'],
        'billing_address' => ['address' => '1 Main Rd'],
        'shipping_method' => 'door',
    ]);

    expect(Order::first())
        ->shipping_total_cents->toBe(11410)   // the live quote, not the R110 flat rate
        ->total_cents->toBe(15910);
});

it('re-quotes server-side and ignores any price sent by the browser', function () {
    fakeLiveRates();
    $user = User::factory()->create();
    basket($user);

    // A tampered request naming a real method but a fabricated price.
    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['address' => '1 Main Rd', 'postal_code' => '8001'],
        'billing_address' => ['address' => '1 Main Rd'],
        'shipping_method' => 'door',
        'shipping_cents' => 1,
        'total_cents' => 4501,
    ]);

    expect(Order::first())->shipping_total_cents->toBe(11410);
});

it('falls back to the cheapest option for an unknown method', function () {
    fakeLiveRates();
    $user = User::factory()->create();
    basket($user);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['address' => '1 Main Rd', 'postal_code' => '8001'],
        'billing_address' => ['address' => '1 Main Rd'],
        'shipping_method' => 'free-please',
    ]);

    // Never free: falls back to a genuine quote.
    expect(Order::first())->shipping_total_cents->toBe(6550);
});

it('requires a postal code to check out', function () {
    $user = User::factory()->create();
    basket($user);

    $this->actingAs($user)->post('/checkout', [
        'shipping_address' => ['address' => '1 Main Rd'],
        'billing_address' => ['address' => '1 Main Rd'],
    ])->assertSessionHasErrors('shipping_address.postal_code');
});
