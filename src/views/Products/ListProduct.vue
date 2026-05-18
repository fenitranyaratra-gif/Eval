<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { cartService } from "@/services/cartService";
import { wishlistService } from "@/services/wishlistService";
import { productService } from "../../services/ProductService";

import Product from "@/components/Product.vue";

const products = ref([]);
const loading = ref(true);
const successMessage = ref("");

const route = useRoute();

onMounted(async () => {
  try {
    const categoryId = route.query.category;

    const response = categoryId
      ? await productService.getByCategory(categoryId)
      : await productService.getAll();

    products.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const handleAddToCart = async ({ id, quantity }) => {
  successMessage.value = "Ajout au panier...";

  try {
    loading.value = true;
    await cartService.add(id, quantity);

    successMessage.value = "Produit ajouté au panier";
    loading.value = false;
  } catch (error) {
    console.error(error);

    successMessage.value = "Erreur panier";
  }

  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

const handleAddToWishlist = async (productId) => {
  try {
    loading.value = true;
    await wishlistService.add(productId);
    loading.value = false;
    successMessage.value = "Ajouté à la wishlist";
  } catch (error) {
    console.error(error);
  }

  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>Products</h1>

      <div class="buttons">
        <router-link to="/cart">
          <button>Panier</button>
        </router-link>

        <router-link to="/wishlist">
          <button>Wishlist</button>
        </router-link>
      </div>
    </div>

    <div v-if="successMessage" class="message">
      {{ successMessage }}
    </div>

    <p v-if="loading === true" class="loading">Chargement</p>
    <div class="products">
      <Product
        v-for="product in products"
        :product="product"
        :key="product.id"
        @add-to-cart="handleAddToCart"
        @add-to-wishlist="handleAddToWishlist"
      />
    </div>
  </div>
</template>
<style scoped>
.container {
  padding: 40px;
  max-width: 1300px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  font-size: 32px;
  color: #222;
  margin: 0;
}

.buttons {
  display: flex;
  gap: 12px;
}

.buttons button {
  padding: 10px 18px;
  border: 1px solid #ddd;
  background: white;
  color: #111;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.buttons button:hover {
  background: #111;
  color: white;
  border-color: #111;
  transform: translateY(-2px);
}

.message {
  margin-bottom: 25px;
  padding: 14px 18px;
  background: #f5f5f5;
  border-left: 4px solid #111;
  border-radius: 8px;
  color: #222;
  width: fit-content;
}

.loading {
  font-size: 15px;
  color: #666;
  margin-bottom: 20px;
}

.products {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
}

a {
  text-decoration: none;
}
</style>
