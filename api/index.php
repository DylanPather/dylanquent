<?php

/**
 * Vercel serverless entrypoint.
 *
 * Every request lands here. Vercel's filesystem is read-only apart from
 * /tmp, so the writable paths Laravel expects are created per invocation
 * before the framework boots.
 */

$storage = '/tmp/storage';
$bootstrap = '/tmp/bootstrap';

foreach ([
    $storage.'/app/public',
    $storage.'/framework/cache/data',
    $storage.'/framework/sessions',
    $storage.'/framework/testing',
    $storage.'/framework/views',
    $storage.'/logs',
    $bootstrap.'/cache',
] as $directory) {
    if (! is_dir($directory)) {
        @mkdir($directory, 0755, true);
    }
}

// Reuse the package manifest built at deploy time when it shipped with the
// bundle; otherwise Laravel regenerates it on each cold start.
foreach (glob(__DIR__.'/../bootstrap/cache/*.php') ?: [] as $cached) {
    $target = $bootstrap.'/cache/'.basename($cached);
    if (! file_exists($target)) {
        @copy($cached, $target);
    }
}

// Both are picked up in bootstrap/app.php.
foreach (['APP_STORAGE_PATH' => $storage, 'APP_BOOTSTRAP_PATH' => $bootstrap] as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

require __DIR__.'/../public/index.php';
