<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Low stock alerts (cheap counts)
        $lowStock = null;
        try {
            $lowStockProducts = \App\Models\Product::query()
                ->where('track_inventory', true)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->where('low_stock_threshold', '>', 0)
                ->count();
            $lowStockVariants = \App\Models\ProductVariant::query()
                ->where('track_inventory', true)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->where('low_stock_threshold', '>', 0)
                ->count();
            $lowStock = [
                'count' => $lowStockProducts + $lowStockVariants,
                'products' => $lowStockProducts,
                'variants' => $lowStockVariants,
            ];
        } catch (\Throwable $e) {
            $lowStock = ['count' => 0, 'products' => 0, 'variants' => 0];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'alerts' => [
                'low_stock' => $lowStock,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'storefrontSettings' => \App\Models\StorefrontSetting::all()->mapWithKeys(function ($item) {
                $value = $item->value;
                if ($item->type === 'json') {
                    $value = json_decode($value, true);
                }
                return [$item->key => $value];
            }),
            'cartCount' => collect(session()->get('cart', []))->sum('quantity'),
        ];
    }
}
