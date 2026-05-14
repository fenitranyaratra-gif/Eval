<script setup>
import { onMounted, ref } from "vue";
import { categorieService } from "../../services/categoryService";
import Category from "@/components/Category.vue";

const categories = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await categorieService.getAll();
        categories.value = response.data;

    } catch (error) {
        console.error(error);

    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="container">

        <h1>Categories</h1>

        <div v-if="loading">
            Chargement des catégories...
        </div>

        <div v-else class="categories">
            <br>
            <Category 
                v-for="category in categories" 
                :category="category" 
                :key="category.id"
            />

        </div>

    </div>
</template>
<style scoped>
.container {
    padding: 30px;
    max-width: 1200px;
    margin: auto;
    font-family: sans-serif;
}

h1 {
    margin-bottom: 25px;
    font-size: 32px;
}

.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-start;
}

.loading {
    padding: 20px 0;
    color: #666;
}
</style>