// services/cartService.js
import { clientApi } from '@/api/clientApi';

export const cartService = {
    // Récupérer le panier
    get() {
        return clientApi('/api/v1/customer/cart', 'GET');
    },

    // Ajouter au panier - corrigé
    add(productId, quantity = 1) {
        // Mettre product_id dans le body ET dans l'URL
        return clientApi(`/api/v1/customer/cart/add/${productId}`, 'POST', {
            product_id: productId,  // ← Ajouter ceci
            quantity: quantity,
            is_buy_now: 0
        });
    },

    // Mettre à jour la quantité d'un item - format selon ta doc
    update(itemId, quantity) {
        return clientApi('/api/v1/customer/cart/update', 'PUT', {
            qty: {
                [itemId]: quantity
            }
        });
    },

    // Supprimer un item spécifique - corrigé (DELETE au lieu de GET)
    removeItem(cartItemId) {
        return clientApi(`/api/v1/customer/cart/remove/${cartItemId}`, 'DELETE');
    },

    // Vider tout le panier
    removeAll() {
        return clientApi('/api/v1/customer/cart/remove', 'DELETE');
    },
};
