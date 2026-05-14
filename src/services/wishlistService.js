import { clientApi } from '@/api/clientApi';

export const wishlistService = {
    getAll() {
        return clientApi('/api/v1/customer/wishlist', 'GET');
    },
    add(productId) {
        return clientApi(`/api/v1/customer/wishlist/${productId}`, 'POST');
    },
    remove(wishlistItemId) {
        return clientApi(`/api/v1/customer/wishlist/${wishlistItemId}`, 'DELETE');
    },
    removeAll() {
        return clientApi('/api/v1/customer/wishlist/all', 'DELETE');
    },
    moveToCart(wishlistItemId) {
        return clientApi(`/api/v1/customer/wishlist/${wishlistItemId}/move-to-cart`, 'POST');
    }
};
   