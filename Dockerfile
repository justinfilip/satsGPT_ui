# Use the official PHP image with Apache
FROM php:7.4-apache

# Install system dependencies for SSL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ssl-cert \
        ca-certificates \
        curl \
        libpq-dev \
        && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
        && docker-php-ext-install pgsql \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# Prepare Apache for SSL
RUN a2enmod ssl && \
    a2ensite default-ssl

# Copy SSL certificates
COPY ./ssl/ /etc/apache2/ssl/
COPY ./ssl/satsgpt_bundle.crt /etc/ssl/certs/satsgpt.crt
COPY ./ssl/satsgpt.key /etc/ssl/private/satsgpt.key
COPY ./000-default.conf /etc/apache2/sites-available/000-default.conf

# And update the Apache SSL configuration to point to your certificates

# Ensure CA certificates are updated for outgoing cURL requests
RUN update-ca-certificates

# Copy your PHP application into the container
COPY ./public /var/www/html

# Expose both HTTP and HTTPS ports
EXPOSE 443

# By default, start Apache in the foreground
CMD ["apache2-foreground"]
