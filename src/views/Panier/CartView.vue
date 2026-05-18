<script setup>
import { onMounted, ref } from "vue";
import { cartService } from "@/services/cartService";
import { useRouter } from "vue-router";

const cart = ref(null);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  await fetchCart();
});

const fetchCart = async () => {
  loading.value = true;
  const response = await cartService.get();
  cart.value = response.data ?? null;
  loading.value = false;
};

const removeItem = async (itemId) => {
  await cartService.removeItem(itemId);
  await fetchCart();
};

const updateQty = async (itemId, qty) => {
  if (qty < 1) return;
  await cartService.update(itemId, qty);
  await fetchCart();
};

const clearCart = async () => {
  await cartService.removeAll();
  cart.value = null;
};

const goToCheckout = () => {
  router.push("/checkout");
};
</script>

<template>
  <button class="btn-back" @click="router.back()">← Retour</button>

  <div class="cart-page">
    <h1>Mon Panier</h1>

    <div v-if="loading">Chargement...</div>

    <div v-else-if="!cart || !cart.items?.length">
      <p>Votre panier est vide.</p>
    </div>

    <div v-else>
      <div v-for="item in cart.items" :key="item.id" class="cart-item">
        <img
          v-if="item.base_image?.small_image_url"
          :src="item.base_image.small_image_url"
          :alt="item.name"
          width="80"
        />
        <div class="item-info">
          <p class="item-name">{{ item.name }}</p>
          <div class="qty-controls">
            <button @click="updateQty(item.id, item.quantity - 1)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQty(item.id, item.quantity + 1)">+</button>
          </div>
          <p>{{ item.formatted_total }}</p>
        </div>
        <button class="remove-btn" @click="removeItem(item.id)">✕</button>
      </div>

      <hr />
      <p class="total">
        <strong>Total : {{ cart.formatted_grand_total }}</strong>
      </p>

      <div class="cart-actions">
        <button class="btn-secondary" @click="clearCart">
          Vider le panier
        </button>
        <button class="btn-primary" @click="goToCheckout">
          Passer la commande →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}
.cart-page {
  padding: 30px;
}
.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.item-info {
  flex: 1;
}
.item-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.qty-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.qty-controls button {
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}
.cart-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #000;
  color: #fff;
  border: none;
  cursor: pointer;
}
.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 1px solid #000;
  cursor: pointer;
}
.total {
  font-size: 1.2rem;
  margin: 1rem 0;
}
</style>
