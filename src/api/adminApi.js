// src/api/adminApi.js
const BASE_URL = import.meta.env.VITE_API_URL;

export const adminApi = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('admin_token');

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return response.json();
};