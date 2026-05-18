<script setup>
import { ref, onMounted } from "vue";
import { productService } from "../services/ProductService";

const props = defineProps(["product"]);
const emit = defineEmits(["add-to-cart", "add-to-wishlist"]);
const stock = ref(0);

onMounted(async () => {
  try {
    const response = await productService.getStock(props.product.id);
    stock.value = response.data.qty;
  } catch (error) {
    console.error(error);
  }
});
const quantity = ref(1);
</script>

<template>
  <div class="product-card">
    <router-link :to="`/products/${product.id}`">
      <img
        v-if="product.base_image?.small_image_url"
        :src="product.base_image.small_image_url"
        :alt="product.name"
        class="product-image"
      />

      <p class="product-name">
        {{ product.name }}
      </p>
    </router-link>
    <p>Stock : {{ stock }}</p>

    <p class="product-price">
      {{ product.prices?.final?.formatted_price || product.formatted_price }}
    </p>

    <div class="qty-controls">
      <button @click="quantity > 1 && quantity--">-</button>

      <span>{{ quantity }}</span>

      <button @click="quantity++">+</button>
    </div>

    <div class="product-actions">
      <button
        class="btn-cart"
        @click="emit('add-to-cart', { id: product.id, quantity })"
      >
        <span>+</span>
        Ajouter
      </button>

      <button class="btn-wishlist" @click="emit('add-to-wishlist', product.id)">
        <span>♥</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}
.product-card {
  width: 220px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.product-name {
  font-weight: bold;
  margin: 0;
}

.product-price {
  color: #444;
  margin: 0;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-controls button {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.btn-cart,
.btn-wishlist {
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-cart {
  flex: 1;
  border: none;
  background: black;
  color: white;
}

.btn-wishlist {
  width: 50px;
  border: 1px solid black;
  background: white;
}
</style>
