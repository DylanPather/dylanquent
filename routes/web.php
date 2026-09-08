<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Inventory\StockController as InventoryStockController;
use App\Http\Controllers\Inventory\WarehouseController as InventoryWarehouseController;
use App\Http\Controllers\Inventory\PurchaseOrderController as InventoryPurchaseOrderController;
use App\Http\Controllers\Sales\OrderController as SalesOrderController;
use App\Http\Controllers\Sales\InvoiceController as SalesInvoiceController;
use App\Http\Controllers\Sales\DiscountCodeController as SalesDiscountCodeController;
use App\Http\Controllers\Catalog\ProductVariantController as CatalogProductVariantController;
use App\Http\Controllers\System\HealthController;

use App\Http\Controllers\Storefront\ProductController as StoreProductController;
use App\Http\Controllers\Storefront\CartController as StoreCartController;
use App\Http\Controllers\Storefront\CheckoutController as StoreCheckoutController;
use App\Http\Controllers\Storefront\OrderController as StoreOrderController;
use App\Http\Controllers\Storefront\PaymentController as StorePaymentController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\Studio\StudioController;
use App\Http\Controllers\Studio\InquiryController as StudioInquiryController;

// Brand gateway — routes visitors into the software studio or the merch storefront.
Route::get('/', [BrandController::class, 'index'])->name('home');

// Division 01 — Dylanquent Software (solo development studio)
Route::prefix('studio')->name('studio.')->group(function () {
    Route::get('/', [StudioController::class, 'index'])->name('index');
    Route::post('/inquiries', [StudioInquiryController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('inquiries.store');
});

// Division 02 — Dylanquent Merch (storefront)
Route::get('/merch', [StoreProductController::class, 'home'])->name('merch.home');

Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/', [StoreProductController::class, 'index'])->name('index');
    Route::get('/{product:slug}', [StoreProductController::class, 'show'])->name('show');
});

Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [StoreCartController::class, 'index'])->name('index');
    Route::post('/add', [StoreCartController::class, 'add'])->name('add');
    Route::post('/update', [StoreCartController::class, 'update'])->name('update');
    Route::post('/remove', [StoreCartController::class, 'remove'])->name('remove');
});

Route::middleware(['auth'])->group(function () {
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [StoreCheckoutController::class, 'index'])->name('index');
        Route::post('/', [StoreCheckoutController::class, 'store'])->name('store');
        Route::get('/success', [StoreCheckoutController::class, 'success'])->name('success');
    });

    Route::prefix('payment')->name('payment.')->group(function () {
        Route::get('/', [StorePaymentController::class, 'show'])->name('show');
        Route::post('/initiate', [StorePaymentController::class, 'initiate'])->name('initiate');
        Route::post('/confirm', [StorePaymentController::class, 'confirm'])->name('confirm');
        Route::get('/success/{order_number}', [StorePaymentController::class, 'success'])->name('success');
    });

    Route::prefix('my-account')->name('customer.')->group(function () {
        Route::get('/orders', [StoreOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order:order_number}', [StoreOrderController::class, 'show'])->name('orders.show');
    });
});

Route::post('/webhooks/payment/{gateway}', [StorePaymentController::class, 'webhook'])->name('webhook.payment');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Studio — project inquiry pipeline
    Route::prefix('studio')->name('studio.')->group(function () {
        Route::get('inquiries', [StudioInquiryController::class, 'index'])->name('inquiries.index');
        Route::put('inquiries/{inquiry}', [StudioInquiryController::class, 'update'])->name('inquiries.update');
        Route::delete('inquiries/{inquiry}', [StudioInquiryController::class, 'destroy'])->name('inquiries.destroy');
    });

    Route::resource('products', ProductController::class);
    Route::resource('customers', \App\Http\Controllers\CustomerController::class)->only(['index', 'show']);

    // Catalog aliases (to match sidebar paths)
    Route::prefix('catalog')->name('catalog.')->group(function () {
        Route::resource('products', ProductController::class)->names('products');
        Route::post('products/{product}/images', [\App\Http\Controllers\Catalog\ProductImageController::class, 'store'])->name('products.images.store');
        Route::put('images/{image}', [\App\Http\Controllers\Catalog\ProductImageController::class, 'update'])->name('images.update');
        Route::delete('images/{image}', [\App\Http\Controllers\Catalog\ProductImageController::class, 'destroy'])->name('images.destroy');
        Route::post('products/{product}/images/reorder', [\App\Http\Controllers\Catalog\ProductImageController::class, 'reorder'])->name('products.images.reorder');
        Route::resource('variants', CatalogProductVariantController::class);
        Route::resource('categories', \App\Http\Controllers\Catalog\CategoryController::class);
        Route::resource('collections', \App\Http\Controllers\Catalog\CollectionController::class);
        Route::resource('reviews', \App\Http\Controllers\Catalog\ReviewController::class);
        Route::resource('attributes', \App\Http\Controllers\Catalog\ProductAttributeController::class);
        Route::get('media', [\App\Http\Controllers\Catalog\MediaLibraryController::class, 'index'])->name('media.index');
        Route::get('bulk-editor', [\App\Http\Controllers\Catalog\BulkEditorController::class, 'index'])->name('bulk-editor.index');
        Route::get('seo', [\App\Http\Controllers\Catalog\SeoMetaController::class, 'index'])->name('seo.index');
    });

    // Inventory
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('stock', [InventoryStockController::class, 'index'])->name('stock.index');
        Route::resource('warehouses', InventoryWarehouseController::class)->except(['show']);
        Route::resource('pos', InventoryPurchaseOrderController::class)->parameters(['pos' => 'purchase_order'])->except(['show']);
        Route::post('pos/{purchase_order}/items', [InventoryPurchaseOrderController::class, 'addItem'])->name('pos.items.store');
        Route::put('pos/{purchase_order}/items/{item}', [InventoryPurchaseOrderController::class, 'updateItem'])->name('pos.items.update');
        Route::delete('pos/{purchase_order}/items/{item}', [InventoryPurchaseOrderController::class, 'destroyItem'])->name('pos.items.destroy');
        Route::post('pos/{purchase_order}/receive', [InventoryPurchaseOrderController::class, 'receive'])->name('pos.receive');
    });

    // Sales
    Route::prefix('sales')->name('sales.')->group(function () {
        Route::get('pos', function () {
            return Inertia::render('sales/pos');
        })->name('pos');
        Route::get('orders', [SalesOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [SalesOrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/mark-shipped', [SalesOrderController::class, 'markAsShipped'])->name('orders.mark-shipped');
        Route::post('orders/{order}/refund', [SalesOrderController::class, 'refund'])->name('orders.refund');
        Route::post('orders/{order}/status', [SalesOrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::get('invoices', [SalesInvoiceController::class, 'index'])->name('invoices.index');
        Route::get('refunds', [\App\Http\Controllers\Sales\RefundController::class, 'index'])->name('refunds.index');
        Route::post('refunds/{order}/process', [\App\Http\Controllers\Sales\RefundController::class, 'processRefund'])->name('refunds.process');
        Route::prefix('discounts')->name('discounts.')->group(function () {
            Route::get('codes', [SalesDiscountCodeController::class, 'index'])->name('codes.index');
            Route::get('codes/create', [SalesDiscountCodeController::class, 'create'])->name('codes.create');
            Route::post('codes', [SalesDiscountCodeController::class, 'store'])->name('codes.store');
            Route::get('codes/{discount}/edit', [SalesDiscountCodeController::class, 'edit'])->name('codes.edit');
            Route::put('codes/{discount}', [SalesDiscountCodeController::class, 'update'])->name('codes.update');
            Route::delete('codes/{discount}', [SalesDiscountCodeController::class, 'destroy'])->name('codes.destroy');
        });
    });

    // Fulfillment
    Route::prefix('fulfillment')->name('fulfillment.')->group(function () {
        Route::get('labels', [\App\Http\Controllers\Fulfillment\ShippingLabelController::class, 'index'])->name('shipping-labels.index');
        Route::get('labels/create/{order}', [\App\Http\Controllers\Fulfillment\ShippingLabelController::class, 'create'])->name('shipping-labels.create');
        Route::post('labels/{order}', [\App\Http\Controllers\Fulfillment\ShippingLabelController::class, 'store'])->name('shipping-labels.store');

        Route::get('pick-pack', [\App\Http\Controllers\Fulfillment\PickPackController::class, 'index'])->name('pick-pack.index');
        Route::get('pick-pack/{order}', [\App\Http\Controllers\Fulfillment\PickPackController::class, 'show'])->name('pick-pack.show');
        Route::post('pick-pack/{order}/packed', [\App\Http\Controllers\Fulfillment\PickPackController::class, 'markAsPacked'])->name('pick-pack.packed');
        Route::post('pick-pack/{order}/ready', [\App\Http\Controllers\Fulfillment\PickPackController::class, 'markAsReady'])->name('pick-pack.ready');

        Route::get('returns', [\App\Http\Controllers\Fulfillment\ReturnsController::class, 'index'])->name('returns.index');
        Route::get('returns/{return}', [\App\Http\Controllers\Fulfillment\ReturnsController::class, 'show'])->name('returns.show');
        Route::post('returns/{return}/approve', [\App\Http\Controllers\Fulfillment\ReturnsController::class, 'approve'])->name('returns.approve');
        Route::post('returns/{return}/decline', [\App\Http\Controllers\Fulfillment\ReturnsController::class, 'decline'])->name('returns.decline');

        Route::get('deliveries', [\App\Http\Controllers\Fulfillment\DeliveriesController::class, 'index'])->name('deliveries.index');
        Route::get('deliveries/{delivery}', [\App\Http\Controllers\Fulfillment\DeliveriesController::class, 'show'])->name('deliveries.show');

        Route::get('couriers', [\App\Http\Controllers\Fulfillment\CourierRatesController::class, 'index'])->name('couriers.index');
        Route::get('couriers/create', [\App\Http\Controllers\Fulfillment\CourierRatesController::class, 'create'])->name('couriers.create');
        Route::post('couriers', [\App\Http\Controllers\Fulfillment\CourierRatesController::class, 'store'])->name('couriers.store');
        Route::get('couriers/{courier}/edit', [\App\Http\Controllers\Fulfillment\CourierRatesController::class, 'edit'])->name('couriers.edit');
        Route::put('couriers/{courier}', [\App\Http\Controllers\Fulfillment\CourierRatesController::class, 'update'])->name('couriers.update');
    });

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('sales', [\App\Http\Controllers\Analytics\SalesReportController::class, 'index'])->name('sales');
        Route::get('products', [\App\Http\Controllers\Analytics\ProductPerformanceController::class, 'index'])->name('products.index');
        Route::get('products/{product}', [\App\Http\Controllers\Analytics\ProductPerformanceController::class, 'show'])->name('products.show');
        Route::get('customers', [\App\Http\Controllers\Analytics\CustomerInsightsController::class, 'index'])->name('customers.index');
        Route::get('customers/{customer}', [\App\Http\Controllers\Analytics\CustomerInsightsController::class, 'show'])->name('customers.show');
        Route::get('funnel-aov', [\App\Http\Controllers\Analytics\FunnelAOVController::class, 'index'])->name('funnel-aov');
        Route::get('cohorts-ltv', [\App\Http\Controllers\Analytics\CohortsLTVController::class, 'index'])->name('cohorts-ltv');
        Route::get('rfm-analysis', [\App\Http\Controllers\Analytics\RFMAnalysisController::class, 'index'])->name('rfm-analysis');
    });

    // Finance
    Route::prefix('finance')->name('finance.')->group(function () {
        Route::get('reconciliation', [\App\Http\Controllers\Finance\ReconciliationController::class, 'index'])->name('reconciliation.index');
        Route::get('reconciliation/{reconciliation}', [\App\Http\Controllers\Finance\ReconciliationController::class, 'show'])->name('reconciliation.show');
        Route::post('reconciliation/{reconciliation}/process', [\App\Http\Controllers\Finance\ReconciliationController::class, 'process'])->name('reconciliation.process');

        Route::get('taxes', [\App\Http\Controllers\Finance\TaxController::class, 'index'])->name('taxes.index');
        Route::get('taxes/{tax}', [\App\Http\Controllers\Finance\TaxController::class, 'show'])->name('taxes.show');
        Route::post('taxes/{tax}/process', [\App\Http\Controllers\Finance\TaxController::class, 'process'])->name('taxes.process');

        Route::get('expenses', [\App\Http\Controllers\Finance\ExpenseController::class, 'index'])->name('expenses.index');
        Route::get('expenses/create', [\App\Http\Controllers\Finance\ExpenseController::class, 'create'])->name('expenses.create');
        Route::post('expenses', [\App\Http\Controllers\Finance\ExpenseController::class, 'store'])->name('expenses.store');
    });

    // Marketing
    Route::prefix('marketing')->name('marketing.')->group(function () {
        Route::get('email', [\App\Http\Controllers\Marketing\EmailCampaignController::class, 'index'])->name('email.index');
        Route::get('email/create', [\App\Http\Controllers\Marketing\EmailCampaignController::class, 'create'])->name('email.create');
        Route::post('email', [\App\Http\Controllers\Marketing\EmailCampaignController::class, 'store'])->name('email.store');

        Route::get('sms', [\App\Http\Controllers\Marketing\SMSCampaignController::class, 'index'])->name('sms.index');
        Route::get('sms/create', [\App\Http\Controllers\Marketing\SMSCampaignController::class, 'create'])->name('sms.create');
        Route::post('sms', [\App\Http\Controllers\Marketing\SMSCampaignController::class, 'store'])->name('sms.store');

        Route::get('banners', [\App\Http\Controllers\Marketing\BannerController::class, 'index'])->name('banners.index');
        Route::get('banners/create', [\App\Http\Controllers\Marketing\BannerController::class, 'create'])->name('banners.create');
        Route::post('banners', [\App\Http\Controllers\Marketing\BannerController::class, 'store'])->name('banners.store');

        Route::get('affiliates', [\App\Http\Controllers\Marketing\AffiliateController::class, 'index'])->name('affiliates.index');
        Route::get('affiliates/create', [\App\Http\Controllers\Marketing\AffiliateController::class, 'create'])->name('affiliates.create');
        Route::post('affiliates', [\App\Http\Controllers\Marketing\AffiliateController::class, 'store'])->name('affiliates.store');
        Route::get('affiliates/{affiliate}', [\App\Http\Controllers\Marketing\AffiliateController::class, 'show'])->name('affiliates.show');

        Route::get('segments', [\App\Http\Controllers\Marketing\CustomerSegmentController::class, 'index'])->name('segments.index');
        Route::get('segments/create', [\App\Http\Controllers\Marketing\CustomerSegmentController::class, 'create'])->name('segments.create');
        Route::post('segments', [\App\Http\Controllers\Marketing\CustomerSegmentController::class, 'store'])->name('segments.store');

        Route::get('abandoned-carts', [\App\Http\Controllers\Marketing\AbandonedCartController::class, 'index'])->name('abandoned-carts.index');
        Route::post('abandoned-carts/{cart}/recover', [\App\Http\Controllers\Marketing\AbandonedCartController::class, 'recover'])->name('abandoned-carts.recover');

        Route::get('loyalty', [\App\Http\Controllers\Marketing\LoyaltyProgramController::class, 'index'])->name('loyalty.index');
        Route::get('loyalty/settings', [\App\Http\Controllers\Marketing\LoyaltyProgramController::class, 'settings'])->name('loyalty.settings');
        Route::post('loyalty/settings', [\App\Http\Controllers\Marketing\LoyaltyProgramController::class, 'updateSettings'])->name('loyalty.update-settings');
    });

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('store', [\App\Http\Controllers\Settings\StoreSettingsController::class, 'index'])->name('store.index');
        Route::post('store', [\App\Http\Controllers\Settings\StoreSettingsController::class, 'update'])->name('store.update');

        Route::get('shipping', [\App\Http\Controllers\Settings\ShippingSettingsController::class, 'index'])->name('shipping.index');
        Route::post('shipping', [\App\Http\Controllers\Settings\ShippingSettingsController::class, 'update'])->name('shipping.update');

        Route::get('integrations', [\App\Http\Controllers\Settings\IntegrationsController::class, 'index'])->name('integrations.index');
        Route::post('integrations/{integration}/connect', [\App\Http\Controllers\Settings\IntegrationsController::class, 'connect'])->name('integrations.connect');
        Route::post('integrations/{integration}/disconnect', [\App\Http\Controllers\Settings\IntegrationsController::class, 'disconnect'])->name('integrations.disconnect');

        Route::get('security', [\App\Http\Controllers\Settings\SecuritySettingsController::class, 'index'])->name('security.index');
        Route::post('security', [\App\Http\Controllers\Settings\SecuritySettingsController::class, 'update'])->name('security.update');
        Route::post('security/sessions/{session}/revoke', [\App\Http\Controllers\Settings\SecuritySettingsController::class, 'revokeSession'])->name('security.revoke-session');
        Route::post('security/api-key', [\App\Http\Controllers\Settings\SecuritySettingsController::class, 'generateAPIKey'])->name('security.generate-key');

        Route::get('sales-channels', [\App\Http\Controllers\Settings\SalesChannelsController::class, 'index'])->name('sales-channels.index');
        Route::get('sales-channels/{channel}', [\App\Http\Controllers\Settings\SalesChannelsController::class, 'show'])->name('sales-channels.show');
        Route::get('sales-channels/{channel}/edit', [\App\Http\Controllers\Settings\SalesChannelsController::class, 'edit'])->name('sales-channels.edit');
    });

    // CMS
    Route::prefix('cms')->name('cms.')->group(function () {
        Route::get('pages', [\App\Http\Controllers\CMS\PageController::class, 'index'])->name('pages.index');
        Route::get('pages/create', [\App\Http\Controllers\CMS\PageController::class, 'create'])->name('pages.create');
        Route::post('pages', [\App\Http\Controllers\CMS\PageController::class, 'store'])->name('pages.store');
        Route::get('pages/{page}/edit', [\App\Http\Controllers\CMS\PageController::class, 'edit'])->name('pages.edit');
        Route::put('pages/{page}', [\App\Http\Controllers\CMS\PageController::class, 'update'])->name('pages.update');

        Route::get('blog', [\App\Http\Controllers\CMS\BlogController::class, 'index'])->name('blog.index');
        Route::get('blog/create', [\App\Http\Controllers\CMS\BlogController::class, 'create'])->name('blog.create');
        Route::post('blog', [\App\Http\Controllers\CMS\BlogController::class, 'store'])->name('blog.store');
        Route::get('blog/{post}/edit', [\App\Http\Controllers\CMS\BlogController::class, 'edit'])->name('blog.edit');
        Route::put('blog/{post}', [\App\Http\Controllers\CMS\BlogController::class, 'update'])->name('blog.update');
    });

    // Support
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('tickets', [\App\Http\Controllers\Support\TicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{ticket}', [\App\Http\Controllers\Support\TicketController::class, 'show'])->name('tickets.show');
        Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\Support\TicketController::class, 'reply'])->name('tickets.reply');
        Route::post('tickets/{ticket}/resolve', [\App\Http\Controllers\Support\TicketController::class, 'resolve'])->name('tickets.resolve');
    });

    // System
    Route::get('system/health', HealthController::class)->name('system.health');
    Route::resource('system/users', \App\Http\Controllers\System\UserController::class);
    Route::get('system/storefront', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'index'])->name('system.storefront.index');
    Route::post('system/storefront', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'update'])->name('system.storefront.update');
    Route::post('system/storefront/upload-image', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'uploadImage'])->name('system.storefront.upload-image');
    Route::get('settings/payments', [\App\Http\Controllers\System\PaymentSettingsController::class, 'show'])->name('settings.payments');
    Route::put('settings/payments', [\App\Http\Controllers\System\PaymentSettingsController::class, 'update'])->name('settings.payments.update');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
