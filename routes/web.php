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

Route::get('/', [StoreProductController::class, 'home'])->name('home');

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

    Route::prefix('my-account')->name('customer.')->group(function () {
        Route::get('/orders', [StoreOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order:order_number}', [StoreOrderController::class, 'show'])->name('orders.show');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('products', ProductController::class);

    // Catalog aliases (to match sidebar paths)
    Route::prefix('catalog')->name('catalog.')->group(function () {
        Route::resource('products', ProductController::class)->names('products');
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
        Route::get('invoices', [SalesInvoiceController::class, 'index'])->name('invoices.index');
        Route::prefix('discounts')->name('discounts.')->group(function () {
            Route::get('codes', [SalesDiscountCodeController::class, 'index'])->name('codes.index');
            Route::get('codes/create', [SalesDiscountCodeController::class, 'create'])->name('codes.create');
            Route::post('codes', [SalesDiscountCodeController::class, 'store'])->name('codes.store');
            Route::get('codes/{discount}/edit', [SalesDiscountCodeController::class, 'edit'])->name('codes.edit');
            Route::put('codes/{discount}', [SalesDiscountCodeController::class, 'update'])->name('codes.update');
            Route::delete('codes/{discount}', [SalesDiscountCodeController::class, 'destroy'])->name('codes.destroy');
        });
    });

    // System
    Route::get('system/health', HealthController::class)->name('system.health');
    Route::get('system/storefront', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'index'])->name('system.storefront.index');
    Route::post('system/storefront', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'update'])->name('system.storefront.update');
    Route::post('system/storefront/upload-image', [\App\Http\Controllers\System\StorefrontSettingsController::class, 'uploadImage'])->name('system.storefront.upload-image');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
