import { clientApi } from '@/api/clientApi';

const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => row[h] = values[i] ?? '');
        return row;
    });
};

const buildRegisterPayload = (row) => {
    return {
        first_name: row.prenom,
        last_name: row.nom,
        email: row.email,
        password: row.pwd,
        password_confirmation: row.pwd,
    };
};

export const csvCustomerImportService = {
    parse(text) {
        return parseCSV(text);
    },

    async importCustomers(rows, onProgress) {
        const results = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            onProgress?.(i + 1, rows.length, row.email);

            try {
                const payload = buildRegisterPayload(row);
                console.log('Payload:', JSON.stringify(payload));

                const response = await clientApi('/api/v1/customer/register', 'POST', payload);
                console.log('Réponse:', JSON.stringify(response));

                
                if (response?.message === 'Votre compte a été créé avec succès.' || response?.data?.id || response?.data?.token) {
                    results.push({ 
                        email: row.email, 
                        status: 'success', 
                        id: response?.data?.id || response?.data?.customer?.id || 'N/A',
                        name: `${row.prenom} ${row.nom}`
                    });
                } else {
                    let msg = response?.message || 'Création échouée';
                    if (response?.errors) msg = Object.values(response.errors).flat().join(' | ');
                    results.push({ email: row.email, status: 'error', message: msg });
                }

            } catch (e) {
                results.push({ email: row.email, status: 'error', message: e.message });
            }
        }

        return results;
    },
};