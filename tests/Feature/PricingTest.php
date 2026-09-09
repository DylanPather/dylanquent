<?php

use App\Services\Pricing\PricingService;

function pricing(): PricingService
{
    return app(PricingService::class);
}

it('charges the flat rate below the free-shipping threshold', function () {
    config(['store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000]);

    $t = pricing()->forSubtotal(13000);           // R130

    expect($t->shippingCents)->toBe(8000)
        ->and($t->totalCents)->toBe(21000)        // R210
        ->and($t->freeShippingRemainingCents)->toBe(87000);
});

it('gives free shipping at and above the threshold', function () {
    config(['store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000]);

    expect(pricing()->forSubtotal(100000)->shippingCents)->toBe(0)
        ->and(pricing()->forSubtotal(150000)->shippingCents)->toBe(0)
        ->and(pricing()->forSubtotal(100000)->freeShippingRemainingCents)->toBeNull();
});

it('charges no tax while not VAT registered', function () {
    config(['store.tax.enabled' => false, 'store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000]);

    $t = pricing()->forSubtotal(13000);

    expect($t->taxCents)->toBe(0)
        ->and($t->totalCents)->toBe(21000);       // subtotal + shipping only
});

it('backs VAT out of the total when registered with inclusive pricing', function () {
    config([
        'store.tax.enabled' => true, 'store.tax.rate' => 0.15, 'store.tax.inclusive' => true,
        'store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000,
    ]);

    $t = pricing()->forSubtotal(13000);

    // Customer still pays the ticket price; VAT is a component of it.
    expect($t->totalCents)->toBe(21000)
        ->and($t->taxCents)->toBe(2739);          // 21000 * 15/115
});

it('adds VAT on top when prices are quoted excluding tax', function () {
    config([
        'store.tax.enabled' => true, 'store.tax.rate' => 0.15, 'store.tax.inclusive' => false,
        'store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000,
    ]);

    $t = pricing()->forSubtotal(13000);

    expect($t->taxCents)->toBe(3150)
        ->and($t->totalCents)->toBe(24150);
});

it('never charges shipping twice or loses cents', function () {
    config(['store.tax.enabled' => true, 'store.tax.inclusive' => true, 'store.tax.rate' => 0.15,
            'store.shipping.flat_cents' => 8000, 'store.shipping.free_over_cents' => 100000]);

    foreach ([1, 999, 13000, 99999, 100000, 250000] as $subtotal) {
        $t = pricing()->forSubtotal($subtotal);
        expect($t->totalCents)->toBe($t->subtotalCents + $t->shippingCents);
        expect($t->taxCents)->toBeLessThanOrEqual($t->totalCents);
    }
});
