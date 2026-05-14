<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from 'vue-router';

import { cartService } from "@/services/cartService";
import { wishlistService } from '@/services/wishlistService';
import { productService } from "../../services/ProductService";

import Product from "@/components/Product.vue";

const products = ref([]);
const loading = ref(true);
const successMessage = ref('');

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
    successMessage.value = 'Ajout au panier...';

    try {
        await cartService.add(id, quantity);

        successMessage.value = 'Produit ajouté au panier';

    } catch (error) {
        console.error(error);

        successMessage.value = 'Erreur panier';
    }

    setTimeout(() => {
        successMessage.value = '';
    }, 3000);
};

const handleAddToWishlist = async (productId) => {
    try {
        await wishlistService.add(productId);

        successMessage.value = 'Ajouté à la wishlist';

    } catch (error) {
        console.error(error);
    }

    setTimeout(() => {
        successMessage.value = '';
    }, 3000);
};
</script>

<template>
    <div class="container">

        <h1>Products</h1>

        <div class="buttons">

            <router-link to="/cart">
                <button>Panier</button>
            </router-link>

            <router-link to="/wishlist">
                <button>Wishlist</button>
            </router-link>

        </div>

        <div v-if="successMessage" class="message">
            {{ successMessage }}
        </div>

        <div v-if="loading">
            Chargement des produits...
        </div>

        <div v-else-if="products.length === 0">
            Aucun produit trouvé.
        </div>

        <div v-else class="products">

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
    padding: 30px;
    font-family: sans-serif;
}

h1 {
    margin-bottom: 20px;
}

.buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

button {
    padding: 10px 15px;
    border: none;
    background: black;
    color: white;
    border-radius: 5px;
    cursor: pointer;
}

.message {
    margin-bottom: 20px;
    padding: 10px;
    background: #f3f3f3;
    border-radius: 5px;
}

.products {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}
</style>