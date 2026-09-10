<?php

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\FirstDropSeeder;
use Database\Seeders\StorefrontProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(StorefrontProductSeeder::class);
    $this->seed(FirstDropSeeder::class);
});

it('builds a print x size matrix on the hoodie', function () {
    $product = Product::where('slug', 'heavy-hoodie')->first();

    expect($product->variants)->toHaveCount(20);

    $designs = $product->variants->pluck('attributes.design')->unique()->values();

    expect($designs->all())->toBe([
        'Quiet Mark', 'Vertical Tokyo', 'Zen Geometry', 'Moon Waifu', 'Shadow Waifu',
    ]);

    expect($product->variants->pluck('attributes.size')->unique()->values()->all())
        ->toBe(['S', 'M', 'L', 'XL']);
});

it('gives every variant its own print image', function () {
    $variants = ProductVariant::whereHas('product', fn ($q) => $q->where('slug', 'heavy-hoodie'))->get();

    expect($variants->whereNull('image_url'))->toBeEmpty();

    // One image per design, shared by that design's four sizes.
    expect($variants->pluck('image_url')->unique())->toHaveCount(5);
});

it('drops the pre-drop size-only variants', function () {
    $product = Product::where('slug', 'heavy-hoodie')->first();

    // StorefrontProductSeeder seeds plain Small/Medium/Large rows first.
    expect($product->variants->whereIn('name', ['Small', 'Medium', 'Large']))->toBeEmpty();
});

it('is idempotent', function () {
    $this->seed(FirstDropSeeder::class);

    expect(Product::where('slug', 'heavy-hoodie')->first()->variants)->toHaveCount(20);
    expect(Collection::where('slug', 'first-drop')->count())->toBe(1);
});

it('puts the hoodie in the First Drop collection with a five-shot gallery', function () {
    $product = Product::where('slug', 'heavy-hoodie')->first();

    expect($product->collections->pluck('slug'))->toContain('first-drop');
    expect($product->images)->toHaveCount(5);
    expect($product->images->where('is_primary', true))->toHaveCount(1);
});

it('exposes the design axis to the product page', function () {
    $this->get('/shop/heavy-hoodie')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/show')
            ->has('variants', 20)
            ->where('variants.0.attributes.design', 'Quiet Mark')
            ->where('variants.0.attributes.size', 'S')
            ->whereNot('variants.0.image_url', null)
            ->has('images', 5));
});

it('carries the chosen print onto the cart line', function () {
    $variant = ProductVariant::where('sku', 'DQ-HD-01-SW-M')->firstOrFail();

    $this->post('/cart/add', [
        'product_id' => $variant->product_id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ])->assertRedirect();

    $line = collect(session('cart'))->firstWhere('variant_id', $variant->id);

    expect($line['name'])->toContain('Shadow Waifu');
    expect($line['thumbnail_url'])->toBe($variant->image_url);
});

it('refuses a sold-out print and size', function () {
    $variant = ProductVariant::where('sku', 'DQ-HD-01-SW-S')->firstOrFail();

    expect($variant->inventoryLevels->sum('quantity'))->toBe(0);

    $this->post('/cart/add', [
        'product_id' => $variant->product_id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ])->assertSessionHasErrors('quantity');

    expect(session('cart'))->toBeNull();
});
