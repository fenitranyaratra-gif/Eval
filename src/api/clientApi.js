const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('customer_token');

export const clientApi = async (endpoint, method = 'GET', body = null) => {
    const token = "8|Klus2d4K0jHDnyaCeWPSc5eMEWjqOUnHpuDXwdgPbe4e51d6";

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return response.json();
};