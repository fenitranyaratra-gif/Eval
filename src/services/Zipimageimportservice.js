const BASE_URL = import.meta.env.VITE_API_URL;

// Upload image via FormData (multipart) — PAS adminApi car Content-Type doit être auto
const uploadWithFormData = async (endpoint, formData) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST', // Laravel accepte POST + _method=PUT pour multipart
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            // NE PAS mettre Content-Type ici — le browser le met auto avec boundary
        },
        body: formData,
    });
    return response.json();
};
const getProductIdBySku = async (sku) => {
    const token = localStorage.getItem('admin_token');
    
    // 1. Récupérer le produit admin
    const response = await fetch(
        `${BASE_URL}/api/v1/admin/catalog/products?sku=${encodeURIComponent(sku)}`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
    );
    const data = await response.json();
    const product = data?.data?.find(p => p.sku === sku);
    if (!product) return null;

    // 2. Récupérer les catégories via l'API shop
    const shopResponse = await fetch(
        `${BASE_URL}/api/products?sku=${encodeURIComponent(sku)}`,
        { headers: { 'Accept': 'application/json' } }
    );
    const shopData = await shopResponse.json();
console.log('Shop product:', JSON.stringify(shopData?.data?.find(p => p.sku === sku)));
const shopProduct = shopData?.data?.find(p => p.sku === sku);
    
    // 3. Merger les données
    return {
    ...product,
    categoryIds: await getCategoryIds(product.id)
};
};
// Extraire les fichiers d'un ZIP via JSZip
const extractImagesFromZip = async (zipFile) => {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipFile);
    const images = [];

    const SUPPORTED = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;

        // Ignorer les fichiers cachés macOS
        if (filename.startsWith('__MACOSX') || filename.startsWith('.')) continue;

        const ext = filename.split('.').pop().toLowerCase();
        if (!SUPPORTED.includes(ext)) continue;

        // Le SKU = nom du fichier sans extension, sans chemin
        const baseName = filename.split('/').pop();
        const sku = baseName.replace(/\.[^/.]+$/, '');

        const blob = await fileObj.async('blob');
        const file = new File([blob], baseName, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

        images.push({ sku, file, filename: baseName });
    }

    return images;
};
const getCategoryIds = async (productId) => {
    const response = await fetch(`${BASE_URL}/api/product-categories/${productId}`);
    const data = await response.json();
    return data?.data || [];
};
export const zipImageImportService = {
    async extractPreview(zipFile) {
        return extractImagesFromZip(zipFile);
    },

    async importImages(images, onProgress) {
        const results = [];

        for (let i = 0; i < images.length; i++) {
            const { sku, file, filename } = images[i];
            onProgress?.(i + 1, images.length, sku);

            try {
                // 1. Trouver le produit par SKU
                const product = await getProductIdBySku(sku);
                if (!product) {
                    results.push({ sku, filename, status: 'error', message: 'Produit introuvable' });
                    continue;
                }

                const productId = product.id;

                // 2. Construire le FormData avec _method=PUT
                // 2. Construire le FormData avec _method=PUT
const formData = new FormData();
formData.append('_method', 'PUT');
formData.append('sku', sku);
formData.append('name', product.name || sku);
formData.append('price', product.price || 0);
formData.append('weight', product.weight || 0.5);
formData.append('status', 1);
formData.append('visible_individually', 1);
formData.append('url_key', product.url_key || sku.toLowerCase().replace(/[^a-z0-9]/g, '-'));
formData.append('short_description', product.short_description || sku);
formData.append('description', product.description || sku);
formData.append('images[files][]', file, filename);
console.log('Product categoryIds:', product.categoryIds); // ← categoryIds pas categories

if (product.categoryIds && product.categoryIds.length > 0) {
    product.categoryIds.forEach(id => {
        formData.append('categories[]', id);
    });
}


                // 3. Envoyer
                const response = await uploadWithFormData(
                    `/api/v1/admin/catalog/products/${productId}`,
                    formData
                );

                if (response?.data?.id) {
                    results.push({ sku, filename, status: 'success', id: productId });
                } else {
                    let msg = response?.message || 'Upload échoué';
                    if (response?.errors) msg = Object.values(response.errors).flat().join(' | ');
                    results.push({ sku, filename, status: 'error', message: msg });
                }

            } catch (e) {
                results.push({ sku, filename, status: 'error', message: e.message });
            }
        }

        return results;
    },
};