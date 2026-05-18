<script setup>
import { onMounted, ref } from "vue";
import { orderService } from "@/services/orderService";

const orders = ref([]);
const loading = ref(true);
const expandedId = ref(null);
const orderDetails = ref({});

onMounted(async () => {
  const response = await orderService.getOrders();
  orders.value = response?.data || [];
  loading.value = false;
});

const toggleOrder = async (orderId) => {
  if (expandedId.value === orderId) {
    expandedId.value = null;
    return;
  }
  expandedId.value = orderId;

  if (!orderDetails.value[orderId]) {
    const response = await orderService.getOrder(orderId);
    orderDetails.value[orderId] = response?.data?.items || [];
  }
};

const statusLabel = (status) => {
  const labels = {
    pending: "En attente",
    processing: "En cours",
    completed: "Complétée",
    canceled: "Annulée",
    closed: "Clôturée",
  };
  return labels[status] || status;
};
</script>

<template>
  <div class="orders-page">
    <router-link to="/products" class="btn-back">← Retour</router-link>
    <br /><br />
    <h1>Mes Commandes</h1>

    <div v-if="loading">Chargement...</div>
    <div v-else-if="!orders.length">
      <p>Vous n'avez pas encore de commandes.</p>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-block">
        <!-- En-tête commande -->
        <div class="order-header" @click="toggleOrder(order.id)">
          <span>#{{ order.id }}</span>
          <span>{{
            new Date(order.created_at).toLocaleDateString("fr-FR")
          }}</span>
          <span>{{ order.formatted_grand_total }}</span>
          <span>{{ statusLabel(order.status) }}</span>
          <span class="toggle">{{ expandedId === order.id ? "▲" : "▼" }}</span>
        </div>

        <!-- Items de la commande -->
        <div v-if="expandedId === order.id" class="order-items">
          <div v-if="!orderDetails[order.id]" class="loading-items">
            Chargement des articles...
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Produit</th>
                <th>SKU</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orderDetails[order.id]" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.sku }}</td>
                <td>{{ item.qty_ordered }}</td>
                <td>{{ item.formatted_price }}</td>
                <td>{{ item.formatted_total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.btn-back {
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
}

.orders-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-block {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9f9f9;
  cursor: pointer;
  gap: 1rem;
}
.order-header:hover {
  background: #f0f0f0;
}
.toggle {
  font-size: 0.75rem;
  color: #999;
}

.order-items {
  padding: 0.75rem 1rem;
}
.loading-items {
  color: #999;
  font-size: 0.9rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th {
  background: #f5f5f5;
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  font-size: 0.85rem;
}
td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}
</style>
