<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Guards every admin page that is wired into the sidebar. Keeps a broken
 * controller from silently shipping a 500 behind a working-looking nav link.
 */
dataset('admin pages', [
    '/dashboard', '/studio/inquiries',
    '/catalog/products', '/catalog/collections', '/catalog/categories',
    '/catalog/attributes', '/catalog/variants', '/catalog/reviews',
    '/catalog/media', '/catalog/bulk-editor', '/catalog/seo',
    '/sales/pos', '/sales/orders', '/sales/invoices', '/sales/refunds',
    '/sales/discounts/codes',
    '/fulfillment/pick-pack', '/fulfillment/labels', '/fulfillment/returns',
    '/fulfillment/deliveries', '/fulfillment/couriers',
    '/inventory/stock', '/inventory/warehouses', '/inventory/pos',
    '/customers', '/marketing/segments', '/marketing/loyalty',
    '/marketing/email', '/marketing/sms', '/marketing/banners', '/marketing/affiliates',
    '/analytics/sales', '/analytics/products', '/analytics/customers', '/analytics/rfm-analysis',
    '/finance/reconciliation', '/finance/taxes', '/finance/expenses',
    '/settings/store', '/settings/payments', '/settings/shipping',
    '/settings/integrations', '/settings/security',
    '/system/users', '/system/storefront', '/system/health',
]);

it('loads without error', function (string $path) {
    $this->seed();
    $admin = User::where('email', 'admin@dylanquent.com')->firstOrFail();

    $this->actingAs($admin)->get($path)->assertOk();
})->with('admin pages');
