<script setup>
import { ref } from 'vue';
import { csvOrderImportService } from '../../services/Csvorderimportservice';

const fileInput = ref(null);
const file = ref(null);
const preview = ref([]);
const results = ref([]);
const progress = ref({ current: 0, total: 0, client: '' });
const importing = ref(false);
const done = ref(false);
const errorMsg = ref('');

// Mots de passe des clients — à remplir manuellement ou via le CSV
// clé = email, valeur = mot de passe
const customerPasswords = ref({});
const passwordInputs = ref([]);

const adminToken = localStorage.getItem('admin_token');

const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    file.value = f;
    done.value = false;
    results.value = [];
    errorMsg.value = '';
    customerPasswords.value = {};

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            preview.value = csvOrderImportService.parse(evt.target.result);
            // Collecter les emails uniques
            const emails = [...new Set(preview.value.map(r => r.client).filter(Boolean))];
            passwordInputs.value = emails;
            emails.forEach(email => {
                customerPasswords.value[email] = '';
            });
        } catch {
            errorMsg.value = 'Fichier CSV invalide.';
        }
    };
    reader.readAsText(f);
};

const startImport = async () => {
    if (!preview.value.length) return;

    // Vérifier que tous les mots de passe sont remplis
    const missing = passwordInputs.value.filter(e => !customerPasswords.value[e]);
    if (missing.length) {
        errorMsg.value = `Mot de passe manquant pour : ${missing.join(', ')}`;
        return;
    }

    errorMsg.value = '';
    importing.value = true;
    done.value = false;
    results.value = [];

    results.value = await csvOrderImportService.importOrders(
        preview.value,
        adminToken,
        customerPasswords.value,
        (current, total, client) => {
            progress.value = { current, total, client };
        }
    );

    importing.value = false;
    done.value = true;
};

const successCount = () => results.value.filter(r => r.status === 'success').length;
const errorCount = () => results.value.filter(r => r.status === 'error').length;

const reset = () => {
    file.value = null;
    preview.value = [];
    results.value = [];
    done.value = false;
    errorMsg.value = '';
    customerPasswords.value = {};
    passwordInputs.value = [];
    progress.value = { current: 0, total: 0, client: '' };
    if (fileInput.value) fileInput.value.value = '';
};
</script>

<template>
    <div class="import-page">
        <h1>Import Commandes CSV</h1>

        <!-- Zone upload -->
        <div class="upload-zone" @click="fileInput.click()">
            <input ref="fileInput" type="file" accept=".csv" style="display:none" @change="onFileChange" />
            <p v-if="!file">Cliquez pour choisir un fichier CSV</p>
            <p v-else> {{ file.name }}</p>
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <!-- Mots de passe clients -->
        <div v-if="passwordInputs.length" class="passwords">
            <h2>Mots de passe clients</h2>
            <p class="info">Les clients doivent exister en base. Entrez leur mot de passe pour le login.</p>
            <div v-for="email in passwordInputs" :key="email" class="pwd-row">
                <label>{{ email }}</label>
                <input
                    v-model="customerPasswords[email]"
                    type="password"
                    placeholder="Mot de passe"
                />
            </div>
        </div>

        <!-- Prévisualisation -->
        <div v-if="preview.length" class="preview">
            <h2>Aperçu — {{ preview.length }} commande(s)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Client</th>
                        <th>Produits</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in preview" :key="i">
                        <td>{{ row.date }}</td>
                        <td>{{ row.heure }}</td>
                        <td>{{ row.client }}</td>
                        <td>{{ row.achat }}</td>
                        <td>{{ row.status }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="actions">
                <button class="btn-secondary" @click="reset">Annuler</button>
                <button class="btn-primary" :disabled="importing" @click="startImport">
                    {{ importing
                        ? `Import en cours... (${progress.current}/${progress.total}) — ${progress.client}`
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
        </div>

        <!-- Résultats -->
        <div v-if="done" class="results">
            <h2>Résultats</h2>
            <p> {{ successCount() }} importée(s) &nbsp;  {{ errorCount() }} erreur(s)</p>
            <table>
                <thead>
                    <tr>
                        <th>Référence</th>
                        <th>Statut</th>
                        <th>Détail</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in results" :key="r.ref" :class="r.status">
                        <td>{{ r.ref }}</td>
                        <td>{{ r.status === 'success' ? 'Ok' : 'Non' }}</td>
                        <td>{{ r.status === 'success' ? `Commande #${r.id}` : r.message }}</td>
                    </tr>
                </tbody>
            </table>
            <button class="btn-secondary" @click="reset">Nouvel import</button>
        </div>
    </div>
</template>

<style scoped>
.import-page { max-width: 900px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; }
h1 { margin-bottom: 1.5rem; }
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
.info { color: #666; font-size: 0.85rem; margin-bottom: 0.75rem; }

.passwords { margin-top: 1.5rem; }
.pwd-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.pwd-row label { min-width: 200px; font-size: 0.9rem; }
.pwd-row input { padding: 0.4rem 0.75rem; border: 1px solid #ccc; border-radius: 4px; flex: 1; }

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
.progress-bar { height: 8px; background: #000; border-radius: 4px; transition: width 0.3s; }

.results { margin-top: 2rem; }
</style>