import { clientApi } from '@/api/clientApi';

export const orderService = {
    saveAddresses(address) {
        return clientApi('/api/v1/customer/checkout/save-address', 'POST', {
            billing: {
                ...address,
                address: [address.address],
                use_for_shipping: true,
            },
            shipping: {
                ...address,
                address: [address.address],
            },
        });
    },
    saveShipping() {
        return clientApi('/api/v1/customer/checkout/save-shipping', 'POST', {
            shipping_method: 'free_free',
        });
    },
    savePayment() {
        return clientApi('/api/v1/customer/checkout/save-payment', 'POST', {
            payment: { method: 'cashondelivery' },
        });
    },
    placeOrder() {
        return clientApi('/api/v1/customer/checkout/save-order', 'POST', {});
    },
    getProfile() {
        return clientApi('/api/v1/customer/get', 'GET');
    },
    getOrders() {
        return clientApi('/api/v1/customer/orders', 'GET');
    },
    getOrder(orderId) {
        return clientApi(`/api/v1/customer/orders/${orderId}`, 'GET');
    },
};