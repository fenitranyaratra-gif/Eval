// src/services/adminAuthService.js
import { adminApi } from '@/api/adminApi';

export const adminAuthService = {
    async login(email, password) {
        const device_name = "front-vue";
        // Pas de token au moment du login donc appel direct
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/admin/login`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password,device_name }),
            }
        );
        

        const data = await response.json();

    if (data?.token) {  // ← ici aussi
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.data));
    }

    return data;

    },

    logout() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
    },

    isLoggedIn() {
        return !!localStorage.getItem('admin_token');
    },

    getAdmin() {
        const a = localStorage.getItem('admin');
        return a ? JSON.parse(a) : null;
    },
};