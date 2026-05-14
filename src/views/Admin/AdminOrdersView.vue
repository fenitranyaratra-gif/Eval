<script setup>
import { onMounted, ref } from 'vue';
import { adminOrderService } from '@/services/adminOrderService';

const orders = ref([]);
const loading = ref(true);
const actionLoading = ref(null);

onMounted(async () => {
    const response = await adminOrderService.getAll();
    orders.value = response?.data || [];
    loading.value = false;
});

const statusLabel = (status) => {
    const labels = {
        pending: '⏳ En attente',
        processing: '🔄 En cours',
        completed: '✅ Complétée',
        canceled: '❌ Annulée',
        closed: '📦 Clôturée',
    };
    return labels[status] || status;
};

const canInvoice = (order) => order.status === 'pending' || order.status === 'processing';
const canShip = (order) => order.status === 'processing';

const buildItems = (order) => {
    const invoiceItems = {};
    const shipmentItems = {};
    order.items?.forEach(item => {
        invoiceItems[item.id] = item.qty_ordered;
        shipmentItems[item.id] = { 1: item.qty_ordered };
    });
    return { invoiceItems, shipmentItems };
};

const markAsPaid = async (order) => {
    actionLoading.value = `invoice-${order.id}`;
    const { invoiceItems } = buildItems(order);
    await adminOrderService.createInvoice(order.id, invoiceItems);
    // Refresh
    const response = await adminOrderService.getAll();
    orders.value = response?.data || [];
    actionLoading.value = null;
};

const markAsShipped = async (order) => {
    actionLoading.value = `ship-${order.id}`;
    const { shipmentItems } = buildItems(order);
    await adminOrderService.createShipment(order.id, shipmentItems);
    // Refresh
    const response = await adminOrderService.getAll();
    orders.value = response?.data || [];
    actionLoading.value = null;
};
</script>

<template>
    <div class="orders-page">
        <h1>Gestion des commandes</h1>

        <div v-if="loading">Chargement...</div>

        <div v-else-if="!orders.length">
            <p>Aucune commande.</p>
        </div>

        <table v-else>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="order in orders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.customer_full_name || order.customer_email }}</td>
                    <td>{{ new Date(order.created_at).toLocaleDateString('fr-FR') }}</td>
                    <td>{{ order.formatted_grand_total }}</td>
                    <td>{{ statusLabel(order.status) }}</td>
                    <td class="actions">
                        <button
                            v-if="canInvoice(order)"
                            class="btn-invoice"
                            :disabled="actionLoading === `invoice-${order.id}`"
                            @click="markAsPaid(order)"
                        >
                            {{ actionLoading === `invoice-${order.id}` ? '...' : '💳 Payé' }}
                        </button>
                        <button
                            v-if="canShip(order)"
                            class="btn-ship"
                            :disabled="actionLoading === `ship-${order.id}`"
                            @click="markAsShipped(order)"
                        >
                            {{ actionLoading === `ship-${order.id}` ? '...' : '🚚 Envoyé' }}
                        </button>
                        <span v-if="order.status === 'completed'">✅ Complétée</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.orders-page { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th { background: #f5f5f5; padding: 0.75rem; text-align: left; border-bottom: 2px solid #ddd; }
td { padding: 0.75rem; border-bottom: 1px solid #eee; }
.actions { display: flex; gap: 0.5rem; }
.btn-invoice { padding: 0.4rem 0.75rem; background: #2196f3; color: white; border: none; cursor: pointer; border-radius: 4px; }
.btn-ship { padding: 0.4rem 0.75rem; background: #4caf50; color: white; border: none; cursor: pointer; border-radius: 4px; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>