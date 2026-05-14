<script setup>
defineProps(['category'])
</script>

<template>
    <div class="category-card">

        <router-link
            :to="`/products?category=${category.id}`"
            class="category-link"
        >
            {{ category.name }}
        </router-link>

        <div
            v-if="category.children && category.children.length"
            class="children"
        >
            <div
                v-for="child in category.children"
                :key="child.id"
            >
                <router-link
                    :to="`/products?category=${child.id}`"
                    class="child-link"
                >
                    - {{ child.name }}
                </router-link>
            </div>
        </div>

    </div>
</template>

<style scoped>
.category-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    width: 220px;
}

.category-link {
    text-decoration: none;
    color: black;
    font-weight: bold;
}

.children {
    margin-top: 10px;
}

.child-link {
    text-decoration: none;
    color: #555;
    font-size: 14px;
}
</style>