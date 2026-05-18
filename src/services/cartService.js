import { clientApi } from '@/api/clientApi';

export const cartService = {
    get() {
        return clientApi('/api/v1/customer/cart', 'GET');
    },

    add(productId, quantity = 1) {
        return clientApi(`/api/v1/customer/cart/add/${productId}`, 'POST', {
            product_id: productId,  
            quantity: quantity,
            is_buy_now: 0
        });
    },

    update(itemId, quantity) {
        return clientApi('/api/v1/customer/cart/update', 'PUT', {
            qty: {
                [itemId]: quantity
            }
        });
    },

    removeItem(cartItemId) {
        return clientApi(`/api/v1/customer/cart/remove/${cartItemId}`, 'DELETE');
    },

    removeAll() {
        return clientApi('/api/v1/customer/cart/remove', 'DELETE');
    },
};
