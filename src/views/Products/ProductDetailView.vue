<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productService } from "@/services/ProductService";
import { cartService } from "@/services/cartService";
import { wishlistService } from "@/services/wishlistService";

const route = useRoute();
const router = useRouter();
const product = ref(null);
const loading = ref(true);
const quantity = ref(1);
const message = ref("");

onMounted(async () => {
  const response = await productService.getOne(route.params.id);
  product.value = response?.data || null;
  loading.value = false;
});

const addToCart = async () => {
  loading.value = true;
  await cartService.add(product.value.id, quantity.value);
  loading.value = false;
  message.value = "✓ Ajouté au panier";
  setTimeout(() => {
    message.value = "";
  }, 3000);
};

const addToWishlist = async () => {
  loading.value = true;
  await wishlistService.add(product.value.id);
  loading.value = false;
  message.value = "♡ Ajouté à la wishlist";
  setTimeout(() => {
    message.value = "";
  }, 3000);
};
</script>

<template>
  <div class="detail-page">
    <button class="btn-back" @click="router.back()">← Retour</button>

    <div v-if="loading">Chargement...</div>

    <div v-else class="detail-content">
      <div class="detail-image">
        <img
          v-if="
            product.images?.[0]?.large_image_url ||
            product.base_image?.large_image_url
          "
          :src="
            product.images?.[0]?.large_image_url ||
            product.base_image?.large_image_url
          "
          :alt="product.name"
        />
      </div>

      <div class="detail-info">
        <h1>{{ product.name }}</h1>
        <p class="sku">SKU : {{ product.sku }}</p>

        <div class="price">
          <span v-if="product.special_price" class="old-price">{{
            product.formatted_price
          }}</span>
          <span class="final-price">
            {{
              product.special_price
                ? product.formatted_special_price
                : product.formatted_price
            }}
          </span>
        </div>

        <p class="description" v-html="product.description"></p>

        <div class="qty-controls">
          <button @click="quantity > 1 && quantity--">−</button>
          <span>{{ quantity }}</span>
          <button @click="quantity++">+</button>
        </div>

        <p v-if="message" class="message">{{ message }}</p>

        <div class="actions">
          <button class="btn-cart" @click="addToCart">
            + Ajouter au panier
          </button>
          <button class="btn-wishlist" @click="addToWishlist">♥</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}
.detail-content {
  display: flex;
  gap: 2rem;
}
.detail-image {
  flex: 1;
}
.detail-image img {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}
.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
h1 {
  font-size: 1.5rem;
  margin: 0;
}
.sku {
  color: #999;
  font-size: 0.85rem;
}
.price {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.old-price {
  text-decoration: line-through;
  color: #999;
}
.final-price {
  font-size: 1.5rem;
  font-weight: bold;
}
.description {
  color: #555;
  line-height: 1.6;
}
.qty-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.qty-controls button {
  width: 32px;
  height: 32px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
}
.actions {
  display: flex;
  gap: 0.75rem;
}
.btn-cart {
  flex: 1;
  padding: 0.75rem;
  background: #000;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1rem;
}
.btn-wishlist {
  width: 50px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1.2rem;
}
.message {
  color: green;
}
</style>
