<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Live courier rates when Bob Go is configured, flat rates otherwise.
        // BobGoRateProvider falls back to the configured rates on any failure,
        // so checkout keeps working through a courier outage.
        $this->app->bind(\App\Services\Shipping\ShippingRateProvider::class, function ($app) {
            $bobgo = config('store.shipping.bobgo');

            if (($bobgo['enabled'] ?? false) && ! empty($bobgo['token'])) {
                return new \App\Services\Shipping\BobGoRateProvider(
                    $app->make(\App\Services\Shipping\ConfiguredRateProvider::class)
                );
            }

            return $app->make(\App\Services\Shipping\ConfiguredRateProvider::class);
        });

        $this->app->singleton(\App\Services\PaymentGateway\PaymentProcessor::class, function ($app) {
            return new \App\Services\PaymentGateway\PaymentProcessor();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
    }
}
