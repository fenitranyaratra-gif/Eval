<script setup>
import { onMounted, ref } from 'vue';
import { wishlistService } from '@/services/wishlistService';
import { cartService } from '@/services/cartService';

const items = ref([]);
const loading = ref(true);
const message = ref('');

onMounted(async () => {
    await fetchWishlist();
});

const fetchWishlist = async () => {
    loading.value = true;
    const response = await wishlistService.getAll();
    items.value = response?.data || [];
    loading.value = false;
};

const removeItem = async (id) => {
    await wishlistService.remove(id);
    await fetchWishlist();
};

const moveToCart = async (id) => {
    await wishlistService.moveToCart(id);
    message.value = '✓ Déplacé dans le panier';
    setTimeout(() => { message.value = ''; }, 3000);
    await fetchWishlist();
};

const clearAll = async () => {
    await wishlistService.removeAll();
    items.value = [];
};
</script>

<template>
    <div class="wishlist-page">
        <h1>Ma Wishlist</h1>

        <p v-if="message" class="message">{{ message }}</p>

        <div v-if="loading">Chargement...</div>

        <div v-else-if="!items.length">
            <p>Votre wishlist est vide.</p>
        </div>

        <div v-else>
            <button class="btn-secondary" @click="clearAll">Tout supprimer</button>

            <div class="wishlist-items">
                <div v-for="item in items" :key="item.id" class="wishlist-item">
                    <img
                        v-if="item.product?.base_image?.small_image_url"
                        :src="item.product.base_image.small_image_url"
                        :alt="item.product?.name"
                        width="80"
                    />
                    <div class="item-info">
                        <p class="item-name">{{ item.product?.name }}</p>
                        <p class="item-price">{{ item.product?.price }}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-cart" @click="moveToCart(item.id)">🛒 Ajouter au panier</button>
                        <button class="btn-remove" @click="removeItem(item.id)">✕</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wishlist-page { max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
.wishlist-items { margin-top: 1rem; }
.wishlist-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #eee; }
.item-info { flex: 1; }
.item-name { font-weight: 600; }
.item-price { color: #555; }
.item-actions { display: flex; gap: 0.5rem; }
.btn-cart { padding: 0.4rem 0.75rem; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px; }
.btn-remove { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; }
.btn-secondary { padding: 0.5rem 1rem; background: #fff; border: 1px solid #000; cursor: pointer; border-radius: 4px; margin-bottom: 1rem; }
.message { margin-bottom: 1rem; }
</style>