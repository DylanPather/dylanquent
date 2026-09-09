<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Controllers may render page components that have not been written yet.
 * Those must degrade to the not-built placeholder, never a 500.
 */
dataset('unbuilt screens', [
    '/settings/payments',
    '/marketing/email/create',
    '/marketing/sms/create',
    '/marketing/banners/create',
    '/marketing/segments/create',
    '/marketing/affiliates/create',
    '/marketing/loyalty/settings',
    '/cms/pages/create',
    '/cms/blog/create',
    '/finance/expenses/create',
    '/fulfillment/couriers/create',
]);

it('degrades gracefully instead of crashing', function (string $path) {
    $this->seed();
    $this->actingAs(User::where('email', 'admin@dylanquent.com')->firstOrFail())
        ->get($path)
        ->assertOk();
})->with('unbuilt screens');
