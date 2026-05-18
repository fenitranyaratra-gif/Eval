<script setup>
import { ref, onMounted , watch} from 'vue';
import { productService } from "@/services/ProductService";

const props = defineProps(['product']);
const emit = defineEmits(['add-to-stock']);
const stock = ref(0);
const quantity = ref(1);

onMounted(async () => {
    try {
        const response = await productService.getStock(props.product.id);
        stock.value = response.data.qty;
    } catch (error) {
        console.error(error);
    }
});
watch(() => props.product._freshStock, (newQty) => {
    if (newQty !== undefined) {
        stock.value = newQty;
        quantity.value = 1;
    }
});
</script>

<template>
    <tr>
        <td>{{ product.name }}</td>
        <td>{{ product.sku }}</td>
        <td>{{ stock }}</td>
        <td>
            <input type="number" v-model="quantity" min="1" class="qty-input" />
        </td>
        <td>{{ Number(quantity) + Number(stock) }}</td>
        <td>
            <button
                class="btn-add"
                @click="emit('add-to-stock', { id: product.id, quantity: Number(quantity) + Number(stock) })"
            >
                Ajouter
            </button>
        </td>
    </tr>
</template>

<style scoped>
td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #eee; vertical-align: middle; }
.qty-input { width: 60px; padding: 0.3rem; border: 1px solid #ccc; border-radius: 4px; text-align: center; }
.btn-add { padding: 0.4rem 0.75rem; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px; }
</style>