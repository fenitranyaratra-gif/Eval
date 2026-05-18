<script setup>
defineProps(["category"]);
</script>

<template>
  <div class="category-card">
    <router-link
      :to="`/products?category=${category.id}`"
      class="category-link"
    >
      {{ category.name }}
    </router-link>

    <div v-if="category.children && category.children.length" class="children">
      <div v-for="child in category.children" :key="child.id">
        <router-link :to="`/products?category=${child.id}`" class="child-link">
          {{ child.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<style scoped>
.category-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  width: 240px;
  background: white;
}

.category-link {
  display: block;
  text-decoration: none;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.children {
  margin-top: 12px;
  padding-left: 8px;
}

.child-link {
  display: block;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  padding: 4px 0;
  line-height: 1.4;
}

.child-link:hover {
  color: #333;
}
</style>
