<?php

use App\Services\Shipping\BobGoRateProvider;
use App\Services\Shipping\ConfiguredRateProvider;
use App\Services\Shipping\ShippingRateProvider;
use Illuminate\Support\Facades\Http;

function bobgo(): BobGoRateProvider
{
    return new BobGoRateProvider(app(ConfiguredRateProvider::class));
}

function enableBobGo(): void
{
    config(['store.shipping.bobgo.enabled' => true, 'store.shipping.bobgo.token' => 'test-key']);
}

it('uses flat rates while Bob Go is disabled', function () {
    config(['store.shipping.bobgo.enabled' => false]);

    expect(app(ShippingRateProvider::class))->toBeInstanceOf(ConfiguredRateProvider::class);
});

it('points at the sandbox by default, never production', function () {
    config(['store.shipping.bobgo.sandbox' => true]);
    expect(bobgo()->baseUrl())->toBe('https://api.sandbox.bobgo.co.za/v2');

    config(['store.shipping.bobgo.sandbox' => false]);
    expect(bobgo()->baseUrl())->toBe('https://api.bobgo.co.za/v2');
});

it('returns live rates cheapest first', function () {
    enableBobGo();
    Http::fake(['*/rates' => Http::response(['provider_rate_requests' => [
        ['provider_slug' => 'tcg', 'provider_name' => 'The Courier Guy', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 114.10, 'rate_amount_excl_vat' => 99.22,
             'service_level' => ['code' => 'ECO', 'name' => 'Economy', 'delivery_type' => 'door']],
        ]],
        ['provider_slug' => 'pudo', 'provider_name' => 'PUDO', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 65.50, 'rate_amount_excl_vat' => 56.96,
             'service_level' => ['code' => 'LOC', 'name' => 'Locker', 'delivery_type' => 'locker']],
        ]],
    ]])]);

    $rates = bobgo()->ratesFor(13000, '2000');

    expect($rates)->toHaveCount(2)
        ->and($rates[0]->cents)->toBe(6550)      // cheapest first
        ->and($rates[0]->method)->toBe('locker')
        // VAT-inclusive amount, since we cannot reclaim the VAT
        ->and($rates[1]->cents)->toBe(11410);
});

it('falls back to flat rates when Bob Go errors', function () {
    enableBobGo();
    Http::fake(['*/rates' => Http::response(['error' => 'unauthorised'], 401)]);

    $rates = bobgo()->ratesFor(13000, '2000');

    // Checkout must survive a courier outage.
    expect(collect($rates)->pluck('method')->all())->toBe(['locker', 'door']);
});

it('falls back when Bob Go times out', function () {
    enableBobGo();
    Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('timed out'));

    expect(bobgo()->ratesFor(13000, '2000'))->not->toBeEmpty();
});

it('falls back when Bob Go returns no rates', function () {
    enableBobGo();
    Http::fake(['*/rates' => Http::response(['provider_rate_requests' => []])]);

    expect(collect(bobgo()->ratesFor(13000, '2000'))->pluck('method')->all())->toBe(['locker', 'door']);
});

it('does not call the courier once free delivery applies', function () {
    enableBobGo();
    Http::fake();

    $rates = bobgo()->ratesFor(150000, '2000');

    Http::assertNothingSent();
    expect(collect($rates)->every(fn ($r) => $r->cents === 0))->toBeTrue();
});

it('keeps the cheapest courier for each delivery style', function () {
    enableBobGo();
    // Several couriers quote the same journey; the customer should not have
    // to choose between six near-identical door-to-door options.
    Http::fake(['*/rates' => Http::response(['provider_rate_requests' => [
        ['provider_slug' => 'a', 'provider_name' => 'Courier A', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 129.00, 'service_level' => ['name' => 'Economy', 'delivery_type' => 'door']],
        ]],
        ['provider_slug' => 'b', 'provider_name' => 'Courier B', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 114.10, 'service_level' => ['name' => 'Economy', 'delivery_type' => 'door']],
        ]],
    ]])]);

    $rates = bobgo()->ratesFor(13000, '2000');

    expect($rates)->toHaveCount(1)
        ->and($rates[0]->cents)->toBe(11410)
        ->and($rates[0]->label)->toContain('Courier B');
});

it('ignores couriers that failed to quote', function () {
    enableBobGo();
    Http::fake(['*/rates' => Http::response(['provider_rate_requests' => [
        ['provider_slug' => 'down', 'provider_name' => 'Down', 'status' => 'failed', 'failed_reason' => 'timeout', 'responses' => []],
        ['provider_slug' => 'up', 'provider_name' => 'Up', 'status' => 'success', 'responses' => [
            ['status' => 'success', 'rate_amount' => 99.00, 'service_level' => ['name' => 'Economy', 'delivery_type' => 'door']],
        ]],
    ]])]);

    $rates = bobgo()->ratesFor(13000, '2000');

    expect($rates)->toHaveCount(1)->and($rates[0]->cents)->toBe(9900);
});
