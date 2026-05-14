<script setup>
import { ref } from 'vue';
import { zipImageImportService } from '../../services/Zipimageimportservice';

const fileInput = ref(null);
const file = ref(null);
const preview = ref([]);   // { sku, filename, url }
const results = ref([]);
const progress = ref({ current: 0, total: 0, sku: '' });
const importing = ref(false);
const done = ref(false);
const errorMsg = ref('');
const loadingZip = ref(false);

const onFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    file.value = f;
    done.value = false;
    results.value = [];
    errorMsg.value = '';
    preview.value = [];
    loadingZip.value = true;

    try {
        const images = await zipImageImportService.extractPreview(f);
        if (!images.length) {
            errorMsg.value = 'Aucune image trouvée dans le ZIP (formats acceptés : jpg, png, webp, gif).';
        } else {
            // Créer des URLs de prévisualisation
            preview.value = images.map(img => ({
                ...img,
                previewUrl: URL.createObjectURL(img.file),
            }));
        }
    } catch (err) {
        errorMsg.value = 'Erreur lors de la lecture du ZIP : ' + err.message;
    }

    loadingZip.value = false;
};

const startImport = async () => {
    if (!preview.value.length) return;

    importing.value = true;
    done.value = false;
    results.value = [];

    results.value = await zipImageImportService.importImages(
        preview.value,
        (current, total, sku) => {
            progress.value = { current, total, sku };
        }
    );

    importing.value = false;
    done.value = true;
};

const successCount = () => results.value.filter(r => r.status === 'success').length;
const errorCount = () => results.value.filter(r => r.status === 'error').length;

const reset = () => {
    // Libérer les URLs de prévisualisation
    preview.value.forEach(img => URL.revokeObjectURL(img.previewUrl));
    file.value = null;
    preview.value = [];
    results.value = [];
    done.value = false;
    errorMsg.value = '';
    progress.value = { current: 0, total: 0, sku: '' };
    if (fileInput.value) fileInput.value.value = '';
};
</script>

<template>
    <div class="import-page">
        <h1>Import Images Produits</h1>
        <p class="subtitle">Chargez un fichier <strong>.zip</strong> contenant des images nommées avec le SKU du produit.<br>
        Exemple : <code>sk-l.jpg</code>, <code>sk-m.png</code></p>

        <!-- Zone upload -->
        <div class="upload-zone" @click="fileInput.click()">
            <input ref="fileInput" type="file" accept=".zip" style="display:none" @change="onFileChange" />
            <p v-if="!file">Cliquez pour choisir un fichier ZIP</p>
            <p v-else> {{ file.name }}</p>
        </div>

        <p v-if="loadingZip" class="info">Lecture du ZIP en cours...</p>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <!-- Prévisualisation -->
        <div v-if="preview.length" class="preview">
            <h2>Aperçu — {{ preview.length }} image(s) trouvée(s)</h2>
            <div class="image-grid">
                <div v-for="img in preview" :key="img.filename" class="image-card">
                    <img :src="img.previewUrl" :alt="img.sku" />
                    <p class="sku-label">{{ img.sku }}</p>
                    <p class="filename">{{ img.filename }}</p>
                </div>
            </div>

            <div class="actions">
                <button class="btn-secondary" @click="reset">Annuler</button>
                <button class="btn-primary" :disabled="importing" @click="startImport">
                    {{ importing
                        ? `Upload en cours... (${progress.current}/${progress.total}) — ${progress.sku}`
                        : 'Lancer l\'import' }}
                </button>
            </div>
        </div>

        <!-- Progression -->
        <div v-if="importing" class="progress-bar-wrap">
            <div
                class="progress-bar"
                :style="{ width: `${(progress.current / progress.total) * 100}%` }"
            ></div>
            <p>{{ progress.sku }}...</p>
        </div>

        <!-- Résultats -->
        <div v-if="done" class="results">
            <h2>Résultats</h2>
            <p>{{ successCount() }} uploadée(s) &nbsp; ❌ {{ errorCount() }} erreur(s)</p>
            <table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Fichier</th>
                        <th>Statut</th>
                        <th>Détail</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in results" :key="r.filename" :class="r.status">
                        <td>{{ r.sku }}</td>
                        <td>{{ r.filename }}</td>
                        <td>{{ r.status === 'success' ? 'Mety' : 'Non' }}</td>
                        <td>{{ r.status === 'success' ? `Produit #${r.id}` : r.message }}</td>
                    </tr>
                </tbody>
            </table>
            <button class="btn-secondary" @click="reset">Nouvel import</button>
        </div>
    </div>
</template>

<style scoped>
.import-page { max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; }
h1 { margin-bottom: 0.5rem; }
.subtitle { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
.subtitle code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
h2 { margin: 1.5rem 0 0.75rem; }

.upload-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s;
}
.upload-zone:hover { border-color: #000; }

.error { color: red; margin-top: 0.5rem; }
.info { color: #666; margin-top: 0.5rem; }

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}
.image-card {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
}
.image-card img {
    width: 100%;
    height: 100px;
    object-fit: contain;
    border-radius: 4px;
    background: #f9f9f9;
}
.sku-label { font-weight: 600; font-size: 0.8rem; margin: 0.4rem 0 0.1rem; }
.filename { font-size: 0.75rem; color: #999; }

table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.875rem; }
th { background: #f5f5f5; padding: 0.5rem 0.75rem; text-align: left; border-bottom: 2px solid #ddd; }
td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #eee; }
tr.error td { background: #fff0f0; }
tr.success td { background: #f0fff4; }

.actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-primary { padding: 0.75rem 1.5rem; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { padding: 0.75rem 1.5rem; background: #fff; border: 1px solid #000; cursor: pointer; border-radius: 4px; }

.progress-bar-wrap { margin-top: 1rem; }
.progress-bar-wrap p { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
.progress-bar { height: 8px; background: #000; border-radius: 4px; transition: width 0.3s; }

.results { margin-top: 2rem; }
</style>