# Flow Panier :

1. POST /api/v1/customer/cart/add/{product_id}
   ↓
   Bagisto crée/met à jour le panier
   Stock NON encore réduit

2. POST /api/v1/customer/checkout/save-address
   ↓
   Adresse billing + shipping sauvegardée dans le panier

3. POST /api/v1/customer/checkout/save-shipping
   ↓
   Méthode de livraison choisie

4. POST /api/v1/customer/checkout/save-payment
   ↓
   Méthode de paiement choisie

5. POST /api/v1/customer/checkout/save-order ← ICI le stock est réduit !
   ↓
   Bagisto fait plusieurs choses en même temps :
   - Crée la commande dans la table orders
   - Crée les order_items
   - RÉDUIT le stock dans product_inventories
   - Vide le panier
   - Envoie l'email de confirmation
   - Statut → "pending"

- Tables concernes :
  orders ← la commande principale
  ├── id, status, grand_total, customer_id...

order_items ← les produits de la commande
├── order_id, product_id, sku, qty_ordered, price...

order_addresses ← adresses billing/shipping
├── order_id, first_name, city, country...

order_payment ← méthode de paiement
├── order_id, method (cashondelivery, paypal...)

product_inventories ← LE STOCK
├── product_id, inventory_source_id, qty

product_flat ← données dénormalisées du produit
├── product_id, name, price, status...

cart ← le panier
├── id, customer_id, is_guest, grand_total...

cart_items ← produits dans le panier
├── cart_id, product_id, quantity, price...

cart_addresses ← adresses du panier
cart_shipping_rates ← méthodes de livraison calculées
invoices ← factures
├── order_id, state, grand_total...

invoice_items ← items facturés
├── invoice_id, product_id, qty...

shipments ← livraisons
├── order_id, status...

shipment_items ← items expédiés
├── shipment_id, product_id, qty...

refunds ← remboursements
refund_items ← items remboursés

Si avec frais de livraison :
// Livraison gratuite
{ shipping_method: 'free_free' } → +0€

// Flat rate`
{ shipping_method: 'flatrate_flatrate' } → +30€ (selon config)

type: "billing" ← adresse de facturation
type: "shipping" ← adresse de livraison

# Status-commande :

Les statuts dans l'ordre
pending → processing → completed
↘ canceled
↘ closed

- pending (En attente)= commande vient d'être passée mais rien n'est expédié.
- processing (En cours) = a créé une facture pour la commande. Ça veut dire que le paiement est confirmé
- completed (Terminée) = La facture ET le shipment ont été créés. Le colis est expédié l'état final normal.
- canceled (Annulée) = commande a été annulée — le stock est restitué automatiquement.
- closed (Fermée) = remboursement a été effectué sur une commande complétée.

pending → save-order seulement
processing → save-order + invoice
completed → save-order + invoice + shipment

UX Flow :
Client passe commande
↓
pending ← save-order

Admin crée facture
↓
processing ← POST /api/v1/admin/sales/invoices/create/{order_id}

Admin crée shipment
↓
completed ← POST /api/v1/admin/sales/shipments/create/{order_id}

# Module :

Annulation (cancel) Remboursement (refund)
──────────────────── ──────────────────────
pending/processing completed seulement
Avant expédition Après réception
Stock restitué Stock peut être restitué
Pas de remboursement $ Remboursement $ au client

# Cost :

SELECT id, code FROM attributes WHERE code = 'cost';

# Cost achat par produits

SELECT p.sku, pav.float_value as cost
FROM product_attribute_values pav
JOIN products p ON p.id = pav.product_id
WHERE pav.attribute_id = (SELECT id FROM attributes WHERE code = 'cost');

# Cost achat total :

SELECT SUM(pav.float_value) as total_achats
FROM product_attribute_values pav
WHERE pav.attribute_id = (SELECT id FROM attributes WHERE code = 'cost');

# Cost achat produits vendu :

SELECT SUM(oi.base_price \* oi.qty_ordered) as cout_total
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN product_attribute_values pav ON pav.product_id = p.id
WHERE pav.attribute_id = (SELECT id FROM attributes WHERE code = 'cost');

# Cost achat total en general de tous les stocks :

SELECT SUM(pav.float_value \* pi.qty) as cout_stock_total
FROM product_attribute_values pav
JOIN product_inventories pi ON pi.product_id = pav.product_id
WHERE pav.attribute_id = (SELECT id FROM attributes WHERE code = 'cost');
