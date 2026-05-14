## Installation REST API Bagisto

1. composer require bagisto/rest-api
2. Ajouter dans bootstrap/providers.php :
   Webkul\RestApi\Providers\RestApiServiceProvider::class
3. php artisan route:clear && php artisan cache:clear
4. Doc disponible sur : https://devdocs.bagisto.com/api/rest-api.html
5. Demo Swagger : https://demo.bagisto.com/bagisto-api-demo-common/api/admin/documentation