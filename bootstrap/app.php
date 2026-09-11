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
        // Vercel keeps only the TAIL of a log message, and a Laravel stack
        // trace runs to seventy-odd frames. What survives is the middleware
        // the request passed through on its way in — TrimStrings, HandleCors —
        // and what gets cut is the exception itself. Reading the cause of a
        // production 500 was impossible: every attempt came back starting at
        // frame #56.
        //
        // Writing a short line *before* the default handler does not help,
        // because it is then the head of the output and the head is what goes.
        // So replace the default report instead: one bounded line carrying the
        // exception and the frames nearest the throw, which is the half of a
        // trace that says anything.
        $exceptions->report(function (\Throwable $e) {
            $relative = fn (?string $path) => $path
                ? str_replace(base_path().'/', '', $path)
                : '[internal]';

            $frames = collect($e->getTrace())
                ->take(10)
                ->map(fn (array $f) => sprintf(
                    '%s:%s %s%s%s()',
                    $relative($f['file'] ?? null),
                    $f['line'] ?? '0',
                    $f['class'] ?? '',
                    $f['type'] ?? '',
                    $f['function'] ?? '',
                ))
                ->implode('  <  ');

            Log::error(sprintf(
                '%s: %s @ %s:%d  <  %s',
                $e::class,
                $e->getMessage(),
                $relative($e->getFile()),
                $e->getLine(),
                $frames,
            ));

            // Stop the default handler. Its full trace is the thing that gets
            // truncated, and letting it run buries the line above.
            return false;
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
