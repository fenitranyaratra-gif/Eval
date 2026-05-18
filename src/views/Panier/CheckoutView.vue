<script setup>
import { ref, onMounted, watch } from "vue";
import { orderService } from "@/services/orderService";
import { useRouter } from "vue-router";

const router = useRouter();

const loading = ref(false);
const error = ref("");
const profile = ref(null);

const defaultAddress = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "0000000000",
  address: "Adresse par défaut",
  city: "Antananarivo",
  state: "Analamanga",
  country: "MG",
  postcode: "101",
};

onMounted(async () => {
  try {
    const response = await orderService.getProfile();

    profile.value = response?.data;

    if (response?.data) {
      defaultAddress.email = response.data.email || "";
      defaultAddress.first_name = response.data.first_name || "Client";
      defaultAddress.last_name = response.data.last_name || "Default";

      console.log("Profil chargé :", response.data);
    }
  } catch (error) {
    console.error("Erreur profil :", error);
  }
});

watch(profile, (newProfile) => {
  console.log("Profil mis à jour :", newProfile);
});

const placeOrder = async () => {
  loading.value = true;
  error.value = "";

  try {
    await orderService.saveAddresses(defaultAddress);

    await orderService.saveShipping();

    await orderService.savePayment();

    const orderResponse = await orderService.placeOrder();

    const orderId =
      orderResponse?.data?.order?.id ||
      orderResponse?.data?.id ||
      orderResponse?.order?.id;

    if (orderId) {
      console.log("Commande créée :", orderId);
      router.push("/orders");
    } else {
      error.value = "Erreur lors de la commande";
    }
  } catch (e) {
    console.error("Erreur commande :", e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="checkout-page">
    <div class="top-bar">
      <button class="btn-back" @click="router.back()">Retour</button>

      <h1>Finaliser la commande</h1>
    </div>

    <div v-if="profile" class="profile-info">
      <h3>Informations client</h3>

      <p>
        <strong>Nom :</strong>
        {{ profile.first_name }} {{ profile.last_name }}
      </p>

      <p>
        <strong>Email :</strong>
        {{ profile.email }}
      </p>

      <p>
        <strong>ID :</strong>
        {{ profile.id }}
      </p>
    </div>

    <div v-else class="profile-info loading-profile">
      Chargement du profil...
    </div>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <div class="summary">
      <p>
        Livraison :
        <strong>Gratuite</strong>
      </p>

      <p>
        Paiement :
        <strong>À la livraison</strong>
      </p>
    </div>

    <button class="btn-primary" :disabled="loading" @click="placeOrder">
      {{ loading ? "Traitement..." : "Confirmer la commande" }}
    </button>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 650px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  background: white;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #222;
}

.btn-back {
  padding: 10px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-back:hover {
  background: #f5f5f5;
}

.profile-info {
  background: #f8f9fb;
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  line-height: 1.7;
}

.loading-profile {
  color: #666;
}

.summary {
  background: #fafafa;
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #eee;
}

.error {
  color: #c62828;
  background: #ffebee;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #111;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s ease;
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
