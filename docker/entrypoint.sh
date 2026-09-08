#!/bin/sh
set -e

# SQLite deployments keep the file on a mounted volume; create it on first boot.
if [ "${DB_CONNECTION}" = "sqlite" ]; then
    DB_FILE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    if [ ! -f "$DB_FILE" ]; then
        echo "Creating SQLite database at $DB_FILE"
        mkdir -p "$(dirname "$DB_FILE")"
        touch "$DB_FILE"
    fi
    chown www-data:www-data "$DB_FILE"
fi

if [ -z "${APP_KEY}" ]; then
    echo "WARNING: APP_KEY is empty. Generate one with: php artisan key:generate --show"
fi

# Rebuild the provider manifest for the production dependency set.
php artisan package:discover --ansi

php artisan migrate --force

# Cached config/routes/views make each request measurably cheaper.
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Only needed when serving uploads from the local disk.
if [ "${FILESYSTEM_DISK:-local}" = "public" ]; then
    php artisan storage:link || true
fi

exec "$@"
