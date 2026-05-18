# Attributs / Famille Attribut

- Attributs → les caractéristiques (nom, prix, couleur...)
  ↓
- Famille d'attributs → on regroupe les attributs par type de produit
  ↓ (ex: Accessoires = nom + prix + matière)
- Produit → on choisit une famille lors de la création
  ↓
- Catégories → on classe le produit dans une ou plusieurs catégories

# Types produits

- simple — Produit basique
  Un produit sans variantes. Le plus courant.

```json
json{
    "type": "simple",
    "attribute_family_id": 1,
    "sku": "TSHIRT-001"
}
```

Exemple : une bougie, un livre, une chaise.

- configurable — Produit avec variantes
  Un produit qui a des déclinaisons comme taille ou couleur.

```json
json{
    "type": "configurable",
    "attribute_family_id": 1,
    "sku": "TSHIRT-001"
}
```

Exemple : un t-shirt qui existe en S, M, L et en rouge, bleu. Chaque combinaison est un produit simple lié au configurable.

- virtual — Produit sans livraison
  Pas de stock, pas de livraison physique.

```json
json{
    "type": "virtual",
    "attribute_family_id": 1,
    "sku": "ABONNEMENT-001"
}
```

Exemple : un abonnement, une garantie, un service.

- downloadable — Produit téléchargeable
  Le client reçoit un fichier après achat.

```json
json{
    "type": "downloadable",
    "attribute_family_id": 1,
    "sku": "EBOOK-001"
}
```

Exemple : un ebook, une musique, un logiciel.

- bundle — Ensemble de produits

```json
json{
    "type": "bundle",
    "attribute_family_id": 1,
    "sku": "PACK-001"
}
```

Un produit composé de plusieurs produits que le client choisit.
Exemple : un PC où tu choisis le processeur, la RAM, le disque dur.

- grouped — Groupe de produits simples
  Plusieurs produits affichés ensemble mais achetés séparément.

```json
json{
    "type": "grouped",
    "attribute_family_id": 1,
    "sku": "COLLECTION-001"
}
```

Exemple : une collection de livres vendus individuellement mais affichés ensemble.

# SKU

Stock Keeping Unit.
SKU
Exemple :
IPHONE15-BLACK-128
C’est :

- unique
- utilisé pour stock/inventaire
- très important en e-commerce.

# ADMIN :

{
"email": "admin@example.com",
"password": "admin123",
"device_name": "mon-frontend-vue"
}

# Apres effacer donnnee

php artisan migrate:fresh --seed

# Client :

{
"email": "Adriano@gmail.com",
"password": "12345678"
}

# Namboariko API :

Tao amin ny :
D:\Evaluation Info\bagisto\vendor\bagisto\rest-api\src\Http\Controllers\V1\Shop\Customer\AuthController.php
// nammboariko
// Event::dispatch('customer.after.login', $request->get('email'));
Event::dispatch('customer.after.login', $customer);

# PHP artisan tinker :

foreach(app('router')->getRoutes() as $route) { if(str_contains($route->uri(), 'api') && str_contains($route->uri(), 'products')) { echo $route->methods()[0] . ' ' . $route->uri() . "\n"; } }

foreach(app('router')->getRoutes() as $route) { if(str_contains($route->uri(), 'api')) { echo $route->methods()[0] . ' ' . $route->uri() . "\n"; } }

# Etapes coommandes :

1. Cart (panier)
   POST /api/v1/customer/cart/add/{productId}
   → Crée une entrée dans la table `carts` + `cart_items`

2. Save Address
   POST /api/v1/customer/checkout/save-address
   → Crée dans `cart_address` (billing + shipping)
   → Retourne les méthodes de livraison disponibles

3. Save Shipping
   POST /api/v1/customer/checkout/save-shipping
   → Enregistre la méthode dans `cart_shipping_rates`
   → Calcule les totaux

4. Save Payment
   POST /api/v1/customer/checkout/save-payment
   → Enregistre la méthode dans `cart_payment`

5. Save Order
   POST /api/v1/customer/checkout/save-order
   → Convertit le cart en order
   → Crée dans `orders` + `order_items` + `order_addresses` + `order_payment`
   → Vide le panier
   → Statut initial = "pending"

6. (Admin) Create Invoice
   POST /api/v1/admin/sales/invoices/{orderId}
   → Crée dans `invoices` + `invoice_items`
   → Statut order → "processing"

7. (Admin) Create Shipment
   POST /api/v1/admin/sales/shipments/{orderId}
   → Crée dans `shipments` + `shipment_items`
   → Statut order → "completed"

# Status :

- status = "pending"
  → étapes 1 à 5 seulement (cart → order)
  → commande créée avec statut "pending" dans Bagisto
  → done

- status = "completed"  
   → étapes 1 à 5 (cart → order)
  → étape 6 : créer invoice → statut passe à "processing"
  → étape 7 : créer shipment → statut passe à "completed"
  → done

# Mouvements Stocks :

- Client ajoute au panier → stock NON réduit (réservé temporairement)
- Client passe la commande → stock RÉDUIT
- Commande annulée → stock RESTITUÉ
- Commande remboursée → stock RESTITUÉ

# Etats :

- pending → stock déjà réduit
- processing → stock réduit
- completed → stock réduit
- canceled → stock restitué
- closed → stock réduit

# Types de quantité dans Bagisto :

- qty → stock total
- qty_ordered → quantité commandée (déduite du stock)
- qty_shipped → quantité expédiée
- qty_invoiced → quantité facturée
- qty_canceled → quantité annulée

=> product_inventories contient le stock :
