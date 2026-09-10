<?php

use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\DropSeeder;
use Database\Seeders\StorefrontProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(StorefrontProductSeeder::class);
    $this->seed(DropSeeder::class);
});

function drop(string $slug): Product
{
    return Product::where('slug', $slug)->firstOrFail();
}

it('builds a print x size matrix on the hoodie', function () {
    $product = drop('heavy-hoodie');

    expect($product->variants)->toHaveCount(20);

    expect(
        $product->variants->sortBy('attributes.design_order')->pluck('attributes.design')->unique()->values()->all()
    )->toBe(['Quiet Mark', 'Vertical Tokyo', 'Zen Geometry', 'Shadow Waifu', 'Moon Waifu']);

    // One colourway, so the product page hides the colour picker entirely.
    expect($product->variants->pluck('attributes.colour')->unique()->all())->toBe(['Black']);
});

it('builds a print x colour x size matrix on the tee', function () {
    $product = drop('boxy-tee');

    // 5 prints x 2 colours x 4 sizes.
    expect($product->variants)->toHaveCount(40);

    expect(
        $product->variants->sortBy('attributes.design_order')->pluck('attributes.design')->unique()->values()->all()
    )->toBe(['Sakura Profile', 'Quiet Gaze', 'Vertical Muse', 'Moon Thread', 'Side Whisper']);

    expect(
        $product->variants->sortBy('attributes.colour_order')->pluck('attributes.colour')->unique()->values()->all()
    )->toBe(['Black', 'White']);

    expect(
        $product->variants->sortBy('attributes.size_order')->pluck('attributes.size')->unique()->values()->all()
    )->toBe(['S', 'M', 'L', 'XL']);
});

it('shoots every print in every colour it sells', function () {
    $product = drop('boxy-tee');

    expect($product->variants->whereNull('image_url'))->toBeEmpty();

    // One photograph per print/colour pair, shared by that pair's four sizes.
    expect($product->variants->pluck('image_url')->unique())->toHaveCount(10);
    expect($product->images)->toHaveCount(10);

    // A print's black and white shots must not be the same file.
    $sakura = $product->variants->where('attributes.design', 'Sakura Profile');

    expect($sakura->firstWhere('attributes.colour', 'Black')->image_url)
        ->not->toBe($sakura->firstWhere('attributes.colour', 'White')->image_url);
});

it('drops the pre-drop size-only variants', function () {
    // StorefrontProductSeeder seeds plain Small/Medium/Large rows first.
    foreach (['heavy-hoodie', 'boxy-tee'] as $slug) {
        expect(drop($slug)->variants->whereIn('name', ['Small', 'Medium', 'Large', 'Extra Large']))->toBeEmpty();
    }
});

it('pins the picker order to the drop, not to row order', function () {
    // Renaming a print reuses its row, so insert order stops matching the drop.
    // The recorded order is what the pickers sort on.
    $product = drop('heavy-hoodie');

    expect($product->variants->firstWhere('attributes.design', 'Shadow Waifu')->attributes['design_order'])->toBe(3)
        ->and($product->variants->firstWhere('attributes.design', 'Moon Waifu')->attributes['design_order'])->toBe(4);

    $tee = drop('boxy-tee');

    expect($tee->variants->firstWhere('attributes.colour', 'Black')->attributes['colour_order'])->toBe(0)
        ->and($tee->variants->firstWhere('attributes.colour', 'White')->attributes['colour_order'])->toBe(1);

    expect($tee->variants->pluck('attributes.size_order')->unique()->sort()->values()->all())->toBe([0, 1, 2, 3]);
});

it('is idempotent', function () {
    $this->seed(DropSeeder::class);

    expect(drop('heavy-hoodie')->variants)->toHaveCount(20);
    expect(drop('boxy-tee')->variants)->toHaveCount(40);
    expect(drop('boxy-tee')->images)->toHaveCount(10);
    expect(Collection::where('slug', 'first-drop')->count())->toBe(1);
});

it('collects both drops under First Drop', function () {
    foreach (['heavy-hoodie', 'boxy-tee'] as $slug) {
        expect(drop($slug)->collections->pluck('slug'))->toContain('first-drop');
        expect(drop($slug)->images->where('is_primary', true))->toHaveCount(1);
    }
});

it('exposes every axis to the product page', function () {
    $this->get('/shop/boxy-tee')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/show')
            ->has('variants', 40)
            ->where('variants.0.attributes.design', 'Sakura Profile')
            ->where('variants.0.attributes.colour', 'Black')
            ->where('variants.0.attributes.size', 'S')
            ->whereNot('variants.0.image_url', null)
            ->has('images', 10));
});

it('gives cards the shots they need to cycle', function () {
    $this->get('/shop')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('shop/index')
            ->has('products.data.0.preview_urls'));

    // Related products carry them too, so the strip below a product also cycles.
    $this->get('/shop/heavy-hoodie')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('related.0.preview_urls'));

    $cards = $this->get('/shop')->viewData('page')['props']['products']['data'];
    $tee = collect($cards)->firstWhere('slug', 'boxy-tee');

    // One shot per print, not per print/colour pair — the card shows the range
    // of prints and leaves the colourways to the product page.
    expect($tee['preview_urls'])->toHaveCount(5);

    // And a product with a single photograph gives the card nothing to cycle.
    $cap = collect($cards)->firstWhere('slug', 'signature-cap');

    expect($cap['preview_urls'])->toHaveCount(1);
});

it('carries the chosen print and colour onto the cart line', function () {
    $variant = ProductVariant::where('sku', 'DQ-TEE-01-SD-WT-M')->firstOrFail();

    $this->post('/cart/add', [
        'product_id' => $variant->product_id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ])->assertRedirect();

    $line = collect(session('cart'))->firstWhere('variant_id', $variant->id);

    expect($line['name'])->toContain('Side Whisper')->toContain('White');
    expect($line['thumbnail_url'])->toBe($variant->image_url);
});

it('refuses a sold-out print, colour and size', function () {
    $variant = ProductVariant::where('sku', 'DQ-TEE-01-SP-WT-S')->firstOrFail();

    expect($variant->inventoryLevels->sum('quantity'))->toBe(0);

    $this->post('/cart/add', [
        'product_id' => $variant->product_id,
        'variant_id' => $variant->id,
        'quantity' => 1,
    ])->assertSessionHasErrors('quantity');

    expect(session('cart'))->toBeNull();

    // The same print in black is unaffected.
    expect(ProductVariant::where('sku', 'DQ-TEE-01-SP-BK-S')->firstOrFail()->inventoryLevels->sum('quantity'))
        ->toBeGreaterThan(0);
});
