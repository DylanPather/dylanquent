<?php

namespace App\Http\Middleware;

use App\Models\TrafficStat;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackTraffic
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('__start', microtime(true));
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (!config('app.collect_traffic', true)) {
            return;
        }
        // Skip some noise
        $path = $request->path();
        if (str_starts_with($path, 'storage') || str_starts_with($path, '_debugbar') || $request->is('up')) {
            return;
        }
        $start = (float) ($request->attributes->get('__start') ?? microtime(true));
        $duration = (int) round((microtime(true) - $start) * 1000);
        try {
            TrafficStat::create([
                'date' => now()->toDateString(),
                'path' => '/'.$path,
                'method' => $request->getMethod(),
                'status' => $response->getStatusCode(),
                'duration_ms' => $duration,
                'user_id' => optional($request->user())->id,
                'visited_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // fail silently
        }
    }
}

