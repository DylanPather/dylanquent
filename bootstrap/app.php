<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetTenantContext;
use App\Http\Middleware\TrackTraffic;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Log;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(prepend: [
            SetTenantContext::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            TrackTraffic::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Vercel keeps only the tail of a log message. A Laravel stack trace
        // runs to seventy-odd frames, so the part that survives is the
        // middleware the request passed through on its way in, and the part
        // that gets cut is the exception itself — the only part worth having.
        // Three separate attempts to read the cause of a production 500 came
        // back with frame #56 onward and nothing else.
        //
        // So log one compact line first. It is short enough to survive intact
        // and carries what a stack trace is for: what broke, and where.
        $exceptions->report(function (\Throwable $e) {
            Log::error(sprintf(
                '%s: %s @ %s:%d',
                $e::class,
                $e->getMessage(),
                str_replace(base_path().'/', '', $e->getFile()),
                $e->getLine(),
            ));
        });
    })->create();

// Serverless hosts have a read-only filesystem, but Laravel still needs to
// write compiled views, sessions, cache and logs. On Vercel this points at
// /tmp; everywhere else it stays unset and the default storage/ is used.
if ($storagePath = env('APP_STORAGE_PATH')) {
    $app->useStoragePath($storagePath);
}

if ($bootstrapPath = env('APP_BOOTSTRAP_PATH')) {
    $app->useBootstrapPath($bootstrapPath);
}

return $app;
