FROM php:8.2-alpine
RUN apk add --no-cache sqlite-dev && docker-php-ext-install pdo_mysql pdo_sqlite
WORKDIR /app
COPY index.html levels.js scores.php schema.sql db_config.example.php package.json ./
CMD ["php", "-S", "0.0.0.0:2000"]
