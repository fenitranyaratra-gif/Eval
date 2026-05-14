<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminAuthService } from '@/services/adminAuthServices';

const router = useRouter();
const email = ref('admin@example.com');
const password = ref('admin123');
const error = ref('');
const loading = ref(false);

const login = async () => {
    error.value = '';
    loading.value = true;

    const response = await adminAuthService.login(email.value, password.value);
    loading.value = false;

    if (response?.token) {  // ← ici response.token pas response.data.token
        router.push('/admin/dashboard');
    } else {
        error.value = response?.message || 'Identifiants incorrects';
    }
};
</script>

<template>
    <div class="login-page">
        <h1>Admin</h1>
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Mot de passe" />
        <p v-if="error" style="color: red">{{ error }}</p>
        <button :disabled="loading" @click="login">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
    </div>
</template>