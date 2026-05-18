<script setup>
import { onMounted, ref } from "vue";
import { productService } from "@/services/ProductService";
import ProductStock from "@/components/ProductStock.vue";

const products = ref([]);
const loading = ref(true);
const successMessage = ref('');

onMounted(async () => {
    try {
        const response = await productService.getAll();
        products.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
});

const handleAddToStock = async ({ id, quantity }) => {
    try {
        await productService.addStock(id, { inventories: { 1: quantity } });
        
        // ← Recharge juste ce produit
        const stockResponse = await productService.getStock(id);
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
            products.value[index]._freshStock = stockResponse.data.qty;
        }
        
        successMessage.value = 'Stock mis à jour';
    } catch (error) {
        successMessage.value = 'Erreur stock';
    }
    setTimeout(() => { successMessage.value = ''; }, 3000);
};
</script>

<template>
    <div class="stock-page">
        <h1>Gestion du Stock</h1>

        <p v-if="successMessage" class="message">{{ successMessage }}</p>
        <div v-if="loading">Chargement...</div>

        <table v-else>
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>SKU</th>
                    <th>Stock actuel</th>
                    <th>Quantité à ajouter</th>
                    <th>Nouveau stock</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <ProductStock
                    v-for="product in products"
                    :product="product"
                    :key="product.id"
                    @add-to-stock="handleAddToStock"
                />
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.stock-page { max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th { background: #f5f5f5; padding: 0.75rem; text-align: left; border-bottom: 2px solid #ddd; }
.message { margin-bottom: 1rem; }
</style>