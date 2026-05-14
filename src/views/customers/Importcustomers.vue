<script setup>
import { ref } from 'vue';
import { csvCustomerImportService } from '../../services/Csvcustomerimport';

const fileInput = ref(null);
const file = ref(null);
const preview = ref([]);
const results = ref([]);
const progress = ref({ current: 0, total: 0, email: '' });
const importing = ref(false);
const done = ref(false);
const errorMsg = ref('');

const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    file.value = f;
    done.value = false;
    results.value = [];
    errorMsg.value = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            preview.value = csvCustomerImportService.parse(evt.target.result);
        } catch {
            errorMsg.value = 'Fichier CSV invalide.';
        }
    };
    reader.readAsText(f);
};

const startImport = async () => {
    if (!preview.value.length) return;

    importing.value = true;
    done.value = false;
    results.value = [];

    results.value = await csvCustomerImportService.importCustomers(
        preview.value,
        (current, total, email) => {
            progress.value = { current, total, email };
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
    progress.value = { current: 0, total: 0, email: '' };
    if (fileInput.value) fileInput.value.value = '';
};
</script>

<template>
    <div class="import-page">
        <h1>Import Clients CSV</h1>

        <!-- Zone upload -->
        <div class="upload-zone" @click="fileInput.click()">
            <input ref="fileInput" type="file" accept=".csv" style="display:none" @change="onFileChange" />
            <p v-if="!file">Cliquez pour choisir un fichier CSV</p>
            <p v-else> {{ file.name }}</p>
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <!-- Prévisualisation -->
        <div v-if="preview.length" class="preview">
            <h2>Aperçu — {{ preview.length }} client(s)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Mot de passe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in preview" :key="i">
                        <td>{{ row.nom }}</td>
                        <td>{{ row.prenom }}</td>
                        <td>{{ row.email }}</td>
                        <td>{{ '•'.repeat(row.pwd?.length || 0) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="actions">
                <button class="btn-secondary" @click="reset">Annuler</button>
                <button class="btn-primary" :disabled="importing" @click="startImport">
                    {{ importing ? `Import en cours... (${progress.current}/${progress.total})` : 'Lancer l\'import' }}
                </button>
            </div>
        </div>

        <!-- Progression -->
        <div v-if="importing" class="progress-bar-wrap">
            <div
                class="progress-bar"
                :style="{ width: `${(progress.current / progress.total) * 100}%` }"
            ></div>
            <p>{{ progress.email }}...</p>
        </div>

        <!-- Résultats -->
        <div v-if="done" class="results">
            <h2>Résultats</h2>
            <p> {{ successCount() }} importé(s) &nbsp;  {{ errorCount() }} erreur(s)</p>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Nom</th>
                        <th>Statut</th>
                        <th>Détail</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in results" :key="r.email" :class="r.status">
                        <td>{{ r.email }}</td>
                        <td>{{ r.name || '—' }}</td>
                        <td>{{ r.status === 'success' ? 'Mety' : 'Non' }}</td>
                        <td>{{ r.status === 'success' ? `ID #${r.id}` : r.message }}</td>
                    </tr>
                </tbody>
            </table>
            <button class="btn-secondary" @click="reset">Nouvel import</button>
        </div>
    </div>
</template>
<style scoped>
.import-page {
    max-width: 900px;
    margin: 30px auto;
    padding: 20px;
    font-family: sans-serif;
}

h1 {
    margin-bottom: 20px;
}

h2 {
    margin-top: 30px;
    margin-bottom: 10px;
}

.upload-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
}

.upload-zone:hover {
    border-color: black;
}

.error {
    color: red;
    margin-top: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 14px;
}

th {
    background: #f3f3f3;
    padding: 10px;
    text-align: left;
    border-bottom: 2px solid #ddd;
}

td {
    padding: 10px;
    border-bottom: 1px solid #eee;
}

tr.error td {
    background: #fff5f5;
}

tr.success td {
    background: #f5fff7;
}

.actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

button {
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
}

.btn-primary {
    background: black;
    color: white;
    border: none;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: white;
    border: 1px solid black;
}

.progress-bar-wrap {
    margin-top: 20px;
}

.progress-bar {
    height: 8px;
    background: black;
    border-radius: 5px;
    transition: 0.3s;
}

.progress-bar-wrap p {
    margin-top: 5px;
    font-size: 14px;
    color: #666;
}

.results {
    margin-top: 30px;
}
</style>