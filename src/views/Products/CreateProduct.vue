<script setup>
import { ref } from "vue";
import { productService } from "../../services/ProductService";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
    sku: '',
    name: '',
    price: '',
    weight: '',       // ← ajoute
    product_number:'',
    description: '',
    status: 1,
    attribute_family_id: 1,
    type: 'simple'
});
const loading = ref(false);
const error = ref(null);
const handleSubmit = async () => {
    loading.value = true;

    try {
        // Étape 1
        const newProduct = await productService.create({
            type: form.value.type,
            attribute_family_id: form.value.attribute_family_id,
            sku: form.value.sku
        });

        console.log('Étape 1 réponse:', newProduct); // ← regarde ici

        const productId = newProduct.data.id;
        console.log('Product ID:', productId); // ← et ici

        // Étape 2
        const updated = await productService.update(productId, {
    channel: 'default',
    locale: 'fr',
    sku: form.value.sku,
    product_number : form.value.product_number,
    url_key: form.value.sku.toLowerCase(),
    name: form.value.name,
    price: form.value.price,
    weight: form.value.weight,        // ← ajoute
    short_description: form.value.description,
    description: form.value.description,
    status: form.value.status,
    inventories: { "1": 100 }
});

        console.log('Étape 2 réponse:', updated); // ← et ici

        // router.push('/products');

    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <h1>Créer un produit</h1>

        <p v-if="error" style="color: red;">{{ error }}</p>

        <form @submit.prevent="handleSubmit">

            <div>
    <label>SKU</label>
    <input 
        v-model="form.sku" 
        placeholder="ex: tshirt-001" 
        @input="form.sku = form.sku.toLowerCase().replace(/[^a-z0-9-]/g, '-')"
        required 
    />
</div>
            <div>
                <label>Prodduct number</label>
                <input v-model="form.product_number" placeholder="product_number du produit" required />
            </div>

            <div>
                <label>Nom</label>
                <input v-model="form.name" placeholder="Nom du produit" required />
            </div>
<div>
    <label>Poids (kg)</label>
    <input v-model="form.weight" type="number" placeholder="0.5" required />
</div>
            <div>
                <label>Prix</label>
                <input v-model="form.price" type="number" placeholder="29.99" required />
            </div>

            <div>
                <label>Description</label>
                <textarea v-model="form.description" placeholder="Description..."></textarea>
            </div>

            <div>
                <label>Type</label>
                <select v-model="form.type">
                    <option value="simple">Simple</option>
                    <option value="virtual">Virtual</option>
                    <option value="downloadable">Downloadable</option>
                </select>
            </div>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Création...' : 'Créer le produit' }}
            </button>

        </form>
    </div>
</template>