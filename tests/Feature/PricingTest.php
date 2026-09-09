<?php

use App\Services\Pricing\PricingService;

function pricing(): PricingService
{
    return app(PricingService::class);
}

it('charges the flat rate below the free-shipping threshold', function () {
    config(['store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000]);

    $t = pricing()->forSubtotal(13000);           // R130

    expect($t->shippingCents)->toBe(8000)
        ->and($t->totalCents)->toBe(21000)        // R210
        ->and($t->freeShippingRemainingCents)->toBe(87000);
});

it('gives free shipping at and above the threshold', function () {
    config(['store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000]);

    expect(pricing()->forSubtotal(100000)->shippingCents)->toBe(0)
        ->and(pricing()->forSubtotal(150000)->shippingCents)->toBe(0)
        ->and(pricing()->forSubtotal(100000)->freeShippingRemainingCents)->toBeNull();
});

it('charges no tax while not VAT registered', function () {
    config(['store.tax.enabled' => false, 'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000]);

    $t = pricing()->forSubtotal(13000);

    expect($t->taxCents)->toBe(0)
        ->and($t->totalCents)->toBe(21000);       // subtotal + shipping only
});

it('backs VAT out of the total when registered with inclusive pricing', function () {
    config([
        'store.tax.enabled' => true, 'store.tax.rate' => 0.15, 'store.tax.inclusive' => true,
        'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000,
    ]);

    $t = pricing()->forSubtotal(13000);

    // Customer still pays the ticket price; VAT is a component of it.
    expect($t->totalCents)->toBe(21000)
        ->and($t->taxCents)->toBe(2739);          // 21000 * 15/115
});

it('adds VAT on top when prices are quoted excluding tax', function () {
    config([
        'store.tax.enabled' => true, 'store.tax.rate' => 0.15, 'store.tax.inclusive' => false,
        'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000,
    ]);

    $t = pricing()->forSubtotal(13000);

    expect($t->taxCents)->toBe(3150)
        ->and($t->totalCents)->toBe(24150);
});

it('never charges shipping twice or loses cents', function () {
    config(['store.tax.enabled' => true, 'store.tax.inclusive' => true, 'store.tax.rate' => 0.15,
            'store.shipping.methods' => ['door' => ['label' => 'Door', 'cents' => 8000]], 'store.shipping.default_method' => 'door', 'store.shipping.free_over_cents' => 100000]);

    foreach ([1, 999, 13000, 99999, 100000, 250000] as $subtotal) {
        $t = pricing()->forSubtotal($subtotal);
        expect($t->totalCents)->toBe($t->subtotalCents + $t->shippingCents);
        expect($t->taxCents)->toBeLessThanOrEqual($t->totalCents);
    }
});

it('offers both South African delivery options', function () {
    $options = pricing()->shippingOptions(13000);

    expect($options)->toHaveCount(2)
        ->and(collect($options)->pluck('method')->all())->toBe(['locker', 'door'])
        ->and(collect($options)->firstWhere('method', 'locker')['cents'])->toBe(6000)
        ->and(collect($options)->firstWhere('method', 'door')['cents'])->toBe(11000);
});

it('charges the locker rate when the customer picks it', function () {
    expect(pricing()->forSubtotal(13000, 'locker')->shippingCents)->toBe(6000)
        ->and(pricing()->forSubtotal(13000, 'door')->shippingCents)->toBe(11000);
});

it('falls back to the default method rather than shipping free', function () {
    // A withdrawn or spoofed method must not zero the delivery charge.
    expect(pricing()->forSubtotal(13000, 'teleportation')->shippingCents)->toBe(11000);
});

it('zeroes every option above the free threshold', function () {
    foreach (pricing()->shippingOptions(150000) as $option) {
        expect($option['cents'])->toBe(0)->and($option['free'])->toBeTrue();
    }
});
