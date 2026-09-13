<?php

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Database\Seeders\DropSeeder;
use Database\Seeders\StorefrontProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(StorefrontProductSeeder::class);
    $this->seed(DropSeeder::class);
});

it('creates the Development Release', function () {
    $product = Product::where('slug', 'development-tee')->firstOrFail();

    expect($product->sku)->toBe('DQ-DEV-01')
        ->and($product->price_cents)->toBe(49_900)
        ->and($product->collections->pluck('slug'))->toContain('development-release')
        // CatalogSeeder files the products that exist when it runs, so a drop
        // that introduces one has to file it itself or its card reads "Archive".
        ->and($product->categories->pluck('slug'))->toContain('tops');

    // 5 prints x 1 colour x 4 sizes.
    expect($product->variants)->toHaveCount(20);

    expect(
        $product->variants->sortBy('attributes.design_order')->pluck('attributes.design')->unique()->values()->all()
    )->toBe(['Zero Noise', 'Source Code', '404 Normal', 'Continuous Motion', 'While Alive']);
});

it('shoots every variant front and back', function () {
    $product = Product::where('slug', 'development-tee')->firstOrFail();

    foreach ($product->variants as $variant) {
        expect($variant->images->pluck('angle')->all())->toBe(['Back', 'Front']);
    }

    // 5 prints x 4 sizes x 2 angles.
    expect(ProductImage::whereIn('product_variant_id', $product->variants->pluck('id'))->count())->toBe(40);
});

it('leads on the shot the print is actually on', function () {
    // These designs put the statement across the back, so that is the shot
    // that carries the cart line and the product card.
    $variant = ProductVariant::where('sku', 'DQ-DEV-01-ZN-BK-M')->firstOrFail();

    expect($variant->image_url)->toContain('zero-noise-back')
        ->and($variant->images->first()->is_primary)->toBeTrue()
        ->and($variant->images->first()->angle)->toBe('Back');
});

it('keeps variant angles out of the product gallery', function () {
    $product = Product::where('slug', 'development-tee')->firstOrFail();

    // One lead shot per print, not every angle of every size.
    expect($product->images)->toHaveCount(5);
    expect($product->allImages()->count())->toBe(45);
});

it('serves each variant its own angles', function () {
    $this->get('/shop/development-tee')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/show')
            ->has('variants', 20)
            ->has('variants.0.images', 2)
            ->where('variants.0.images.0.angle', 'Back')
            ->where('variants.0.images.1.angle', 'Front')
            ->has('images', 5));
});

it('leaves single-angle drops with one unlabelled shot', function () {
    // The hoodie is shot once, so it has no angles to name.
    $variant = ProductVariant::where('sku', 'DQ-HD-01-QM-BK-M')->firstOrFail();

    expect($variant->images)->toHaveCount(1)
        ->and($variant->images->first()->angle)->toBeNull()
        ->and($variant->image_url)->toBe($variant->images->first()->url);
});

it('is idempotent', function () {
    $this->seed(DropSeeder::class);

    $product = Product::where('slug', 'development-tee')->firstOrFail();

    expect($product->variants)->toHaveCount(20);
    expect(ProductImage::whereIn('product_variant_id', $product->variants->pluck('id'))->count())->toBe(40);
    expect($product->images)->toHaveCount(5);
});

it('drops a variant angles with it', function () {
    $variant = ProductVariant::where('sku', 'DQ-DEV-01-ZN-BK-M')->firstOrFail();
    $imageIds = $variant->images->pluck('id');

    $variant->delete();

    expect(ProductImage::whereIn('id', $imageIds)->count())->toBe(0);
});

it('sells each Development Hoodie print in the one colourway it was set on', function () {
    $product = Product::where('slug', 'development-hoodie')->firstOrFail();

    // 9 prints x 1 colourway each x 4 sizes. The release spans four body
    // colours, but a print exists only on the one it was set on — the naive
    // print x colour matrix would have written 144 variants, three quarters of
    // them for garments that were never made.
    expect($product->variants)->toHaveCount(36);

    $colourways = $product->variants
        ->groupBy(fn ($v) => $v->attributes['design'])
        ->map(fn ($group) => $group->pluck('attributes.colour')->unique()->values()->all());

    expect($colourways->every(fn ($colours) => count($colours) === 1))->toBeTrue()
        ->and($colourways->flatten()->unique()->sort()->values()->all())
        ->toBe(['Black', 'Bone', 'Grey', 'Teal']);

    // Every variant is photographed, front and back, and none is a ghost left
    // by a print/colour pair that was never shot.
    expect($product->variants->whereNull('image_url'))->toBeEmpty();

    $variant = ProductVariant::where('sku', 'DQ-DEVHD-01-SI-TL-M')->firstOrFail();

    expect($variant->images->pluck('angle')->all())->toBe(['Front', 'Back'])
        ->and($variant->image_url)->toContain('hoodie-ship-it-front.webp');

    // One card shot per print, not per angle.
    expect($product->images)->toHaveCount(9);
});

it('leaves Silent Hero out until its front is re-exported', function () {
    // The front export is truncated — only the top third of the image
    // survives. Shipping it would put a half-rendered hoodie on the shop.
    expect(ProductVariant::where('sku', 'like', 'DQ-DEVHD-01-SH-%')->count())->toBe(0);

    expect(public_path('images/products/development-release/hoodie-silent-hero-front.webp'))
        ->not->toBeFile();
});
