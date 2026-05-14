import { adminApi } from '@/api/adminApi';

export const adminOrderService = {
    getAll() {
        return adminApi('/api/v1/admin/sales/orders');
    },
    getOne(id) {
        return adminApi(`/api/v1/admin/sales/orders/${id}`);
    },
    createInvoice(orderId, items) {
        return adminApi(`/api/v1/admin/sales/invoices/${orderId}`, 'POST', {
            invoice: { items }
        });
    },
    createShipment(orderId, items) {
        return adminApi(`/api/v1/admin/sales/shipments/${orderId}`, 'POST', {
            shipment: {
                source: 1,
                carrier_title: 'Livraison',
                track_number: '',
                total_qty: Object.values(items).reduce((a, b) => a + Object.values(b)[0], 0),
                items
            }
        });
    },
};