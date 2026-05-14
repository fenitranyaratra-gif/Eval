// services/csvImportService.js
import { adminApi } from '@/api/adminApi';
import { categorieService } from './categoryService';

const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    let lastType = '';

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => row[h] = values[i] ?? '');
        if (!row.type) row.type = lastType;
        else lastType = row.type;
        return row;
    });
};

const buildProductPayload = (row, categoryId) => ({  // ← ajoute categoryId
    sku: row.sku,
    name: row.name,
    price: parseFloat(row.prix_vente) || 0,
    cost: parseFloat(row.prix_achat) || 0,
    special_price: row.prix_promo ? parseFloat(row.prix_promo) : null,
    weight: parseFloat(row.weight) || 0.5,
    status: 1,
    visible_individually: 1,
    guest_checkout: 1,
    manage_stock: 1,
    url_key: row.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    short_description: row.name,
    description: row.name,
    meta_title: '',
    meta_keywords: '',
    meta_description: '',
    inventories: { 1: parseInt(row.stock_initial) || 0 },
    categories: categoryId ? [categoryId] : [],  // ← ici
});

export const csvImportService = {
    parse(text) {
        return parseCSV(text);
    },

    async importProducts(rows, onProgress) {
        const results = [];
        
        // Cache des catégories pour éviter de recréer à chaque fois
        const categoryCache = new Map();

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            onProgress?.(i + 1, rows.length, row.sku);

            try {
                // 1. Vérifier/créer la catégorie
                let categoryId = null;
                if (row.Categorie) {
                    if (categoryCache.has(row.Categorie)) {
                        categoryId = categoryCache.get(row.Categorie);
                    } else {
                        categoryId = await categorieService.getOrCreateCategory(row.Categorie);
                        categoryCache.set(row.Categorie, categoryId);
                    }
                }
                
                // 2. Créer le produit
                const created = await adminApi('/api/v1/admin/catalog/products', 'POST', {
                    type: row.type || 'simple',
                    sku: row.sku,
                    attribute_family_id: 1,
                });

                if (!created?.data?.id) {
                    let msg = created?.message || 'Création échouée';
                    if (created?.errors) msg = Object.values(created.errors).flat().join(' | ');
                    results.push({ sku: row.sku, status: 'error', message: msg });
                    continue;
                }

                const productId = created.data.id;
                
                // 3. Mettre à jour les détails du produit
                // 3. Mettre à jour les détails du produit
const payload = buildProductPayload(row, categoryId);  // ← passe categoryId
const updated = await adminApi(`/api/v1/admin/catalog/products/${productId}`, 'PUT', payload);
console.log('Updated response:', JSON.stringify(updated)); // ← ajoute ça
                if (!updated?.data?.id) {
                    let msg = updated?.message || 'Mise à jour échouée';
                    if (updated?.errors) msg = Object.values(updated.errors).flat().join(' | ');
                    results.push({ sku: row.sku, status: 'error', message: msg });
                    continue;
                }
                
               
                
                results.push({ 
                    sku: row.sku, 
                    status: 'success', 
                    id: productId, 
                    category: row.Categorie,
                    categoryId: categoryId
                });

            } catch (e) {
                console.error(`Erreur import ${row.sku}:`, e);
                results.push({ sku: row.sku, status: 'error', message: e.message });
            }
        }

        return results;
    },
};