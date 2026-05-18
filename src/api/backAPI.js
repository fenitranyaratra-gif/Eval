// src/api/bridgeApi.js
const BRIDGE_URL = 'http://localhost:3001';

export const backAPI = async (endpoint, method = 'GET', body = null) => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BRIDGE_URL}${endpoint}`, options);
    return response.json();
};