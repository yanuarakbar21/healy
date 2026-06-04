FROM php:8.3-fpm-alpine AS build

RUN apk add --no-cache \
    nginx \
    supervisor \
    nodejs \
    npm \
    git \
    unzip \
    curl \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip gd exif

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && npm ci --ignore-scripts \
    && npm run build \
    && rm -rf node_modules

FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip gd exif \
    && mkdir -p /var/log/supervisor

COPY --from=build /app /app
COPY --from=build /usr/bin/composer /usr/bin/composer

RUN mkdir -p /app/storage/framework/{cache,sessions,views,testing} \
    && mkdir -p /app/storage/logs \
    && mkdir -p /app/public/storage \
    && chmod -R 775 /app/storage /app/bootstrap/cache \
    && chown -R www-data:www-data /app/storage /app/bootstrap/cache /app/public/storage

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["/app/docker/entrypoint.sh"]
