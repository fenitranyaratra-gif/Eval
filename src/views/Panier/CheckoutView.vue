<script setup>
import { ref, onMounted } from 'vue';
import { orderService } from '@/services/orderService';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const profile = ref(null); // Ajout de la ref pour profile

const defaultAddress = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '0000000000',
    address: 'Adresse par défaut',
    city: 'Antananarivo',
    state: 'Analamanga',  // ← ajoute ça
    country: 'MG',
    postcode: '101'
};

onMounted(async () => {
    console.log('=== DÉBUT onMounted ===');
    console.log('🔄 Récupération du profil utilisateur...');
    
    try {
        const response = await orderService.getProfile();
        console.log('📦 Réponse complète getProfile:', response);
        console.log('📊 Data du profil:', response?.data);
        
        profile.value = response?.data;
        
        if (response?.data) {
            console.log('✅ Profil chargé avec succès');
            console.log('👤 Détails profil:', {
                id: response.data.id,
                email: response.data.email,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                full_name: `${response.data.first_name} ${response.data.last_name}`
            });
            
            // Mettre à jour l'adresse par défaut
            defaultAddress.email = response.data.email || '';
            defaultAddress.first_name = response.data.first_name || 'Client';
            defaultAddress.last_name = response.data.last_name || 'Default';
            
            console.log('📝 Adresse par défaut après mise à jour:', {
                first_name: defaultAddress.first_name,
                last_name: defaultAddress.last_name,
                email: defaultAddress.email
            });
        } else {
            console.warn('⚠️ Aucune donnée profil reçue');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        console.error('Détails erreur:', error.response?.data || error.message);
    }
    
    console.log('=== FIN onMounted ===');
});

// Ajout d'un watch pour surveiller les changements du profil
import { watch } from 'vue';
watch(profile, (newProfile, oldProfile) => {
    console.log('👀 Profil changé:');
    console.log('Ancien:', oldProfile);
    console.log('Nouveau:', newProfile);
}, { deep: true });

const placeOrder = async () => {
    console.log('\n=== PLACEMENT DE COMMANDE ===');
    console.log('📋 Adresse utilisée:', defaultAddress);
    console.log('🔄 Sauvegarde des adresses...');
    
    loading.value = true;
    error.value = '';
    
    try {
        const addressResponse = await orderService.saveAddresses(defaultAddress);
        console.log('✅ Adresses sauvegardées:', addressResponse);
        
        console.log('🚚 Sauvegarde livraison...');
        const shippingResponse = await orderService.saveShipping();
        console.log('✅ Livraison sauvegardée:', shippingResponse);
        
        console.log('💳 Sauvegarde paiement...');
        const paymentResponse = await orderService.savePayment();
        console.log('✅ Paiement sauvegardé:', paymentResponse);
        
        console.log('📦 Finalisation de la commande...');
        const orderResponse = await orderService.placeOrder();
console.log('Order response complet:', JSON.stringify(orderResponse));

const orderId = orderResponse?.data?.order?.id 
    || orderResponse?.data?.id 
    || orderResponse?.order?.id;

if (orderId) {
    router.push('/orders');
} else {
    error.value = orderResponse?.message || 'Erreur lors de la commande';
}
        if (orderResponse?.data?.order?.id) {
            console.log(`✅ Commande créée avec succès ! ID: ${orderResponse.data.order.id}`);
            router.push('/orders');
        } else {
            console.error('❌ Pas d\'ID de commande dans la réponse');
            error.value = orderResponse?.message || 'Erreur lors de la commande';
        }
        
    } catch (e) {
        console.error('❌ ERREUR lors de la commande:');
        console.error('- Message:', e.message);
        console.error('- Status:', e.response?.status);
        console.error('- Data:', e.response?.data);
        error.value = e.message;
    } finally {
        loading.value = false;
        console.log('=== FIN PLACEMENT COMMANDE ===\n');
    }
};
</script>

<template>
    <div class="checkout-page">
        <h1>Finaliser la commande</h1>
        
        <!-- Affichage du profil pour déboguer -->
        <div v-if="profile" class="profile-info">
            <h3>👤 Informations client</h3>
            <p><strong>Nom:</strong> {{ profile.first_name }} {{ profile.last_name }}</p>
            <p><strong>Email:</strong> {{ profile.email }}</p>
            <p><strong>ID:</strong> {{ profile.id }}</p>
        </div>
        <div v-else class="profile-info loading">
            <p>🔄 Chargement du profil...</p>
        </div>
        
        <p v-if="error" class="error">{{ error }}</p>
        
        <div class="summary">
            <p>🚚 Livraison : <strong>Gratuite</strong></p>
            <p>💳 Paiement : <strong>À la livraison</strong></p>
        </div>
        
        <button class="btn-primary" :disabled="loading" @click="placeOrder">
            {{ loading ? 'Traitement...' : 'Confirmer la commande' }}
        </button>
    </div>
</template>

<style scoped>
.checkout-page { 
    max-width: 400px; 
    margin: 2rem auto; 
    padding: 1rem; 
}

.profile-info {
    background: #e3f2fd;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    font-size: 14px;
}

.profile-info.loading {
    background: #f5f5f5;
    color: #666;
}

.summary { 
    background: #f9f9f9; 
    padding: 1rem; 
    border-radius: 4px; 
    margin: 1rem 0; 
}

.error { 
    color: red; 
}

.btn-primary { 
    width: 100%; 
    padding: 0.75rem; 
    background: #000; 
    color: #fff; 
    border: none; 
    cursor: pointer; 
    border-radius: 4px; 
}

.btn-primary:disabled { 
    opacity: 0.5; 
}
</style>