<?php

/**
 * Vercel serverless entrypoint.
 *
 * Every request lands here. Vercel's filesystem is read-only apart from
 * /tmp, so the writable paths Laravel expects are created per invocation
 * before the framework boots.
 */

$storage = '/tmp/storage';

foreach ([
    $storage.'/app/public',
    $storage.'/framework/cache/data',
    $storage.'/framework/sessions',
    $storage.'/framework/testing',
    $storage.'/framework/views',
    $storage.'/logs',
] as $directory) {
    if (! is_dir($directory)) {
        @mkdir($directory, 0755, true);
    }
}

// Picked up in bootstrap/app.php via useStoragePath().
putenv('APP_STORAGE_PATH='.$storage);
$_ENV['APP_STORAGE_PATH'] = $storage;
$_SERVER['APP_STORAGE_PATH'] = $storage;

require __DIR__.'/../public/index.php';
