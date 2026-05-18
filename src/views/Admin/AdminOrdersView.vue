<script setup>
import { onMounted, ref } from "vue";
import { adminOrderService } from "@/services/adminOrderService";

const orders = ref([]);
const loading = ref(true);
const actionLoading = ref(null);
const expandedId = ref(null);

onMounted(async () => {
  const response = await adminOrderService.getAll();
  orders.value = response?.data || [];
  loading.value = false;
});

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

const toggleOrder = (orderId) => {
  expandedId.value = expandedId.value === orderId ? null : orderId;
};

const canInvoice = (order) =>
  order.status === "pending" || order.status === "processing";
const canShip = (order) => order.status === "processing";

const buildItems = (order) => {
  const invoiceItems = {};
  const shipmentItems = {};
  order.items?.forEach((item) => {
    invoiceItems[item.id] = item.qty_ordered;
    shipmentItems[item.id] = { 1: item.qty_ordered };
  });
  return { invoiceItems, shipmentItems };
};

const markAsPaid = async (order) => {
  actionLoading.value = `invoice-${order.id}`;
  const { invoiceItems } = buildItems(order);
  await adminOrderService.createInvoice(order.id, invoiceItems);
  const response = await adminOrderService.getAll();
  orders.value = response?.data || [];
  actionLoading.value = null;
};

const markAsShipped = async (order) => {
  actionLoading.value = `ship-${order.id}`;
  const { shipmentItems } = buildItems(order);
  await adminOrderService.createShipment(order.id, shipmentItems);
  const response = await adminOrderService.getAll();
  orders.value = response?.data || [];
  actionLoading.value = null;
};
</script>

<template>
  <div class="orders-page">
    <h1>Gestion des commandes</h1>

    <div v-if="loading">Chargement...</div>
    <div v-else-if="!orders.length"><p>Aucune commande.</p></div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-block">
        <!-- En-tête -->
        <div class="order-header" @click="toggleOrder(order.id)">
          <span>#{{ order.id }}</span>
          <span>{{ order.customer_full_name || order.customer_email }}</span>
          <span>{{
            new Date(order.created_at).toLocaleDateString("fr-FR")
          }}</span>
          <span>{{ order.formatted_grand_total }}</span>
          <span class="status">{{ statusLabel(order.status) }}</span>
          <div class="actions" @click.stop>
            <button
              v-if="canInvoice(order)"
              class="btn-primary"
              :disabled="actionLoading === `invoice-${order.id}`"
              @click="markAsPaid(order)"
            >
              {{ actionLoading === `invoice-${order.id}` ? "..." : "Payé" }}
            </button>
            <button
              v-if="canShip(order)"
              class="btn-secondary"
              :disabled="actionLoading === `ship-${order.id}`"
              @click="markAsShipped(order)"
            >
              {{ actionLoading === `ship-${order.id}` ? "..." : "Envoyé" }}
            </button>
            <span v-if="order.status === 'completed'" class="completed"
              >Complétée</span
            >
          </div>
          <span class="toggle">{{ expandedId === order.id ? "▲" : "▼" }}</span>
        </div>

        <!-- Items -->
        <div v-if="expandedId === order.id" class="order-items">
          <table>
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
              <tr v-for="item in order.items" :key="item.id">
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
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}
h1 {
  margin-bottom: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.order-block {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f9f9f9;
  cursor: pointer;
  flex-wrap: wrap;
}
.order-header:hover {
  background: #f0f0f0;
}
.order-header span {
  font-size: 0.9rem;
}

.status {
  font-weight: 600;
}
.toggle {
  margin-left: auto;
  font-size: 0.75rem;
  color: #999;
}

.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-primary {
  padding: 0.35rem 0.75rem;
  background: #000;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.85rem;
}
.btn-secondary {
  padding: 0.35rem 0.75rem;
  background: #fff;
  color: #000;
  border: 1px solid #000;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.85rem;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.completed {
  font-size: 0.85rem;
  color: #555;
}

.order-items {
  padding: 0.75rem 1rem;
  background: #fff;
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
