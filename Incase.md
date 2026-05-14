import { clientApi } from '@/api/clientApi';

export const orderService = {
    // Étape 1 : sauvegarder l'adresse
    saveAddresses(address) {
        return clientApi('/api/checkout/onepage/addresses', 'POST', {
            billing: {
                ...address,
                use_for_shipping: true,
            },
            shipping: {
                ...address,
            },
        });
    },

    // Étape 2 : sélectionner livraison gratuite (free / flatrate)
    saveShipping(shippingMethodCode = 'free_free') {
        return clientApi('/api/checkout/onepage/shipping-methods', 'POST', {
            shipping_method: shippingMethodCode,
        });
    },

    // Étape 3 : forcer "paiement à la livraison"
    savePayment() {
        return clientApi('/api/checkout/onepage/payment-methods', 'POST', {
            payment: { method: 'cashondelivery' },
        });
    },

    // Étape 4 : passer la commande
    placeOrder() {
        return clientApi('/api/checkout/onepage/orders', 'POST');
    },

    // Mes commandes
    getOrders() {
        return clientApi('/api/v1/customer/orders', 'GET');
    },

    // Détail d'une commande
    getOrder(orderId) {
        return clientApi(`/api/v1/customer/orders/${orderId}`, 'GET');
    },
};