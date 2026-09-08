<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $store = $this->detectStore($request);
        app()->bind('currentStore', fn () => $store);

        return $next($request);
    }

    private function detectStore(Request $request): ?Store
    {
        $host = $request->getHost();
        $parts = explode('.', $host);

        // Try domain-based detection first
        $store = Store::where('domain', $host)->first();
        if ($store) {
            return $store;
        }

        // Try subdomain-based detection (e.g., store.localhost:8000)
        if (count($parts) > 2 || (count($parts) == 2 && !in_array($parts[0], ['localhost', 'www']))) {
            $subdomain = $parts[0];
            $store = Store::where('slug', $subdomain)->first();
            if ($store) {
                return $store;
            }
        }

        // Return null if no store found (for storefront)
        return null;
    }
}
