#!/bin/sh
set -e

if [ -z "$APP_KEY" ]; then
    php artisan key:generate
fi

php artisan storage:link --force 2>/dev/null || true

php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -c /app/docker/supervisord.conf
