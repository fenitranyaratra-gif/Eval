<script setup>
import { ref } from "vue";
import { adminApi } from "@/api/adminApi";
import { backAPI } from "@/api/backAPI";

const loading = ref(false);
const message = ref("");
const adminToken = localStorage.getItem("admin_token"); // ← ici
console.log(adminToken);
const resetDatabase = async () => {
  try {
    loading.value = true;
    message.value = "Réinitialisation en cours...";

    await backAPI("/reset-database", "POST");

    message.value = "Base réinitialisée !";

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    message.value = "Erreur lors de la réinitialisation";
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <div class="page-wrapper">
    <!-- La "Card" principale inspirée de l'image -->
    <div class="admin-card">
      <header class="card-header">
        <h1 class="title">Admin</h1>
        <p v-if="message" class="message-banner">{{ message }}</p>
      </header>

      <div class="action-list">
        <router-link to="/products/inventory" class="nav-link">
          <button class="btn-secondary">Stock</button>
        </router-link>
        <router-link to="/admin/orders" class="nav-link">
          <button class="btn-secondary">Commandes</button>
        </router-link>
        <!-- Bouton de navigation -->
        <router-link to="/admin/import-images" class="nav-link">
          <button class="btn-secondary">Importer des Images</button>
        </router-link>
        <router-link to="/admin/import-global" class="nav-link">
          <button class="btn-secondary">Import global (3 files)</button>
        </router-link>

        <!-- Bouton d'action critique -->
        <button @click="resetDatabase" class="btn-danger" :disabled="loading">
          {{
            loading
              ? "Traitement en cours..."
              : "Réinitialiser la base de données"
          }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.admin-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 18px;
  padding: 28px;
  border: 1px solid #eee;
}

.card-header {
  margin-bottom: 24px;
  text-align: center;
}

.title {
  font-size: 26px;
  margin: 0;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

button,
.full-width-input {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 15px;
  cursor: pointer;
}

.full-width-input {
  background: #f7f7f7;
}

.btn-secondary {
  background: rgb(237, 236, 236);
  color: rgb(26, 26, 26);
  border: none;
}

.btn-danger {
  background: #fff3f2;
  color: #d9534f;
  border: 1px solid #f1c7c4;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-banner {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f3f3f3;
  font-size: 14px;
}

.nav-link {
  text-decoration: none;
}
</style>
