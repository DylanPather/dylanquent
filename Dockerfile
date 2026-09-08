# ---------- 1. Front-end assets ----------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.ts tsconfig.json ./
COPY public ./public
RUN npm run build

# ---------- 2. PHP dependencies ----------
# Composer must run on the same PHP version as the runtime: the composer:2
# image ships PHP 8.5, which the lock file does not allow.
FROM php:8.3-cli-alpine AS vendor
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN apk add --no-cache unzip git
WORKDIR /app
COPY composer.json composer.lock ./
# Artisan isn't available yet, so skip the post-install scripts.
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# ---------- 3. Runtime ----------
FROM php:8.3-fpm-alpine AS runtime

RUN apk add --no-cache nginx supervisor sqlite-libs postgresql-libs icu-libs \
    && apk add --no-cache --virtual .build-deps postgresql-dev icu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql pdo_pgsql intl opcache bcmath \
    && apk del .build-deps

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
# Never ship a locally-built manifest: it references dev-only providers.
RUN rm -f bootstrap/cache/*.php
COPY --from=assets /app/public/build ./public/build

# The web server runs unprivileged; these are the only paths Laravel writes to.
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache database \
    && chown -R www-data:www-data storage bootstrap/cache database \
    && chmod -R 775 storage bootstrap/cache database

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080
ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
