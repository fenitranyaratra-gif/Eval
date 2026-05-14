<script setup>
import { onMounted, ref } from 'vue';
import { orderService } from '@/services/orderService';

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
    const response = await orderService.getOrders();
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
</script>

<template>
    <div class="orders-page">
        <h1>Mes Commandes</h1>

        <div v-if="loading">Chargement...</div>

        <div v-else-if="!orders.length">
            <p>Vous n'avez pas encore de commandes.</p>
        </div>

        <div v-else>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in orders" :key="order.id">
                        <td>#{{ order.id }}</td>
                        <td>{{ new Date(order.created_at).toLocaleDateString('fr-FR') }}</td>
                        <td>{{ order.formatted_grand_total }}</td>
                        <td>{{ statusLabel(order.status) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.orders-page { max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th { background: #f5f5f5; padding: 0.75rem; text-align: left; border-bottom: 2px solid #ddd; }
td { padding: 0.75rem; border-bottom: 1px solid #eee; }
</style>