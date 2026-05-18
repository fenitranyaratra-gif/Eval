<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { adminAuthService } from "@/services/adminAuthServices";

const router = useRouter();
const email = ref("admin@example.com");
const password = ref("admin123");
const error = ref("");
const loading = ref(false);

const login = async () => {
  error.value = "";
  loading.value = true;

  const response = await adminAuthService.login(email.value, password.value);
  loading.value = false;

  if (response?.token) {
    // ← ici response.token pas response.data.token
    router.push("/admin/dashboard");
  } else {
    error.value = response?.message || "Identifiants incorrects";
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Admin</h1>

      <input v-model="email" type="email" placeholder="Email" />

      <input v-model="password" type="password" placeholder="Mot de passe" />

      <p v-if="error" class="error">{{ error }}</p>

      <button :disabled="loading" @click="login">
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 350px;
}

h1 {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #999;
}

button {
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
}
</style>
