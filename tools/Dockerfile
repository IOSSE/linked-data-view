FROM php:8.2-apache

# Aktivieren von mod_rewrite
RUN a2enmod rewrite

# Setze die richtige DocumentRoot und aktiviere mod_rewrite in der Apache-Konfiguration
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
    </Directory>\n' > /etc/apache2/conf-enabled/rewrite.conf

# Expose Port 80
EXPOSE 80
