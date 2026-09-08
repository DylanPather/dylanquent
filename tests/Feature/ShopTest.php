<?php

use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeProduct(int $stock = 10, bool $track = true): array
{
    $product = Product::create([
        'name' => 'Boxy Tee', 'slug' => 'boxy-tee', 'sku' => 'DQ-TEE', 'price_cents' => 4500,
        'currency' => 'ZAR', 'is_active' => true, 'description' => 'A tee.',
    ]);
    $variant = ProductVariant::create([
        'product_id' => $product->id, 'name' => 'Medium', 'sku' => 'DQ-TEE-M',
        'price_cents' => 5500, 'track_inventory' => $track, 'is_active' => true,
    ]);
    $warehouse = Warehouse::create(['name' => 'JHB', 'code' => 'JHB-01', 'is_active' => true]);
    InventoryLevel::create([
        'product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id, 'quantity' => $stock,
    ]);

    return [$product, $variant];
}

it('renders a product page with variants, stock and images', function () {
    [$product, $variant] = makeProduct(3);

    $this->get('/shop/boxy-tee')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/show')
            ->where('product.name', 'Boxy Tee')
            ->has('variants', 1)
            ->where('variants.0.stock', 3)
            ->where('variants.0.is_available', true)
            ->where('variants.0.price_cents', 5500)
            ->has('images')
            ->has('related'));
});

it('404s on an inactive product', function () {
    [$product] = makeProduct();
    $product->update(['is_active' => false]);

    $this->get('/shop/boxy-tee')->assertNotFound();
});

it('marks a variant unavailable when stock runs out', function () {
    [, $variant] = makeProduct(0);

    $this->get('/shop/boxy-tee')
        ->assertInertia(fn ($page) => $page
            ->where('variants.0.stock', 0)
            ->where('variants.0.is_available', false));
});

it('adds to cart using the variant price, not the base product price', function () {
    [$product, $variant] = makeProduct(10);

    $this->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2,
    ])->assertRedirect();

    $line = collect(session('cart'))->first();
    expect($line['price_cents'])->toBe(5500)   // variant price, base is 4500
        ->and($line['quantity'])->toBe(2)
        ->and($line['name'])->toBe('Boxy Tee — Medium');
});

it('refuses to add more than the available stock', function () {
    [$product, $variant] = makeProduct(3);

    $this->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 5,
    ])->assertSessionHasErrors('quantity');

    expect(session('cart'))->toBeNull();
});

it('counts what is already in the cart against available stock', function () {
    [$product, $variant] = makeProduct(3);

    $this->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2])
        ->assertSessionHasNoErrors();

    $this->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 2])
        ->assertSessionHasErrors('quantity');

    expect(collect(session('cart'))->first()['quantity'])->toBe(2);
});

it('refuses a sold-out variant', function () {
    [$product, $variant] = makeProduct(0);

    $this->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1])
        ->assertSessionHasErrors('quantity');
});

it('rejects a variant belonging to a different product', function () {
    [$product] = makeProduct(10);
    $other = Product::create([
        'name' => 'Cap', 'slug' => 'cap', 'sku' => 'DQ-CAP-P', 'price_cents' => 3500, 'currency' => 'ZAR', 'is_active' => true,
    ]);
    $foreign = ProductVariant::create([
        'product_id' => $other->id, 'name' => 'One size', 'sku' => 'DQ-CAP',
        'price_cents' => 3500, 'track_inventory' => false, 'is_active' => true,
    ]);

    $this->post('/cart/add', [
        'product_id' => $product->id, 'variant_id' => $foreign->id, 'quantity' => 1,
    ])->assertSessionHasErrors('variant_id');

    expect(session('cart'))->toBeNull();
});

it('caps a cart quantity update to available stock', function () {
    [$product, $variant] = makeProduct(4);

    $this->post('/cart/add', ['product_id' => $product->id, 'variant_id' => $variant->id, 'quantity' => 1]);
    $key = array_key_first(session('cart'));

    $this->post('/cart/update', ['id' => $key, 'quantity' => 99])
        ->assertSessionHasErrors('quantity');

    expect(session('cart')[$key]['quantity'])->toBe(1);
});
