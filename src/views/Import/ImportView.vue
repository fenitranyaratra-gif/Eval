<script setup>
import { ref, computed } from 'vue';
import { csvCustomerImportService } from '@/services/Csvcustomerimport';
import { csvImportService } from '@/services/CsvImportService';
import { csvOrderImportService } from '@/services/Csvorderimportservice';

// ─── Fichiers ───────────────────────────────────────────
const customerFile = ref(null);
const productFile  = ref(null);
const orderFile    = ref(null);

const customerInput = ref(null);
const productInput  = ref(null);
const orderInput    = ref(null);

// ─── Données parsées ────────────────────────────────────
const customerRows = ref([]);
const productRows  = ref([]);
const orderRows    = ref([]);

// ─── Résultats par étape ────────────────────────────────
const customerResults = ref([]);
const productResults  = ref([]);
const orderResults    = ref([]);

// ─── État global ────────────────────────────────────────
const step       = ref(0); // 0=upload, 1=clients, 2=produits, 3=commandes, 4=terminé
const progress   = ref({ current: 0, total: 0, label: '' });
const running    = ref(false);
const errorMsg   = ref('');

// Map email → password extrait du CSV clients
const customerPasswords = ref({});

// ─── Helpers ────────────────────────────────────────────
const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
});

const onFileChange = async (e, type) => {
    const f = e.target.files[0];
    if (!f) return;

    const text = await readFile(f);

    if (type === 'customers') {
        customerFile.value = f;
        customerRows.value = csvCustomerImportService.parse(text);
        // Extraire les mots de passe
        customerRows.value.forEach(row => {
            if (row.email && row.pwd) customerPasswords.value[row.email] = row.pwd;
        });
    } else if (type === 'products') {
        productFile.value = f;
        productRows.value = csvImportService.parse(text);
    } else if (type === 'orders') {
        orderFile.value = f;
        orderRows.value = csvOrderImportService.parse(text);
    }
};

const allFilesLoaded = computed(() =>
    customerRows.value.length > 0 &&
    productRows.value.length > 0 &&
    orderRows.value.length > 0
);

const adminToken = localStorage.getItem('admin_token');

// ─── Import séquentiel ──────────────────────────────────
const startImport = async () => {
    if (!allFilesLoaded.value) {
        errorMsg.value = 'Veuillez charger les 3 fichiers CSV.';
        return;
    }
    errorMsg.value = '';
    running.value = true;

    // ÉTAPE 1 — Clients
    step.value = 1;
    customerResults.value = await csvCustomerImportService.importCustomers(
        customerRows.value,
        (current, total, email) => { progress.value = { current, total, label: email }; }
    );

    // ÉTAPE 2 — Produits
    step.value = 2;
    productResults.value = await csvImportService.importProducts(
        productRows.value,
        (current, total, sku) => { progress.value = { current, total, label: sku }; }
    );

    // ÉTAPE 3 — Commandes
    step.value = 3;
    orderResults.value = await csvOrderImportService.importOrders(
        orderRows.value,
        adminToken,
        customerPasswords.value,
        (current, total, client) => { progress.value = { current, total, label: client }; }
    );

    step.value = 4;
    running.value = false;
};

// ─── Helpers résultats ──────────────────────────────────
const ok  = (arr) => arr.filter(r => r.status === 'success').length;
const err = (arr) => arr.filter(r => r.status === 'error').length;

const reset = () => {
    customerFile.value = null; productFile.value = null; orderFile.value = null;
    customerRows.value = []; productRows.value = []; orderRows.value = [];
    customerResults.value = []; productResults.value = []; orderResults.value = [];
    customerPasswords.value = {};
    step.value = 0; running.value = false; errorMsg.value = '';
    progress.value = { current: 0, total: 0, label: '' };
    if (customerInput.value) customerInput.value.value = '';
    if (productInput.value)  productInput.value.value  = '';
    if (orderInput.value)    orderInput.value.value    = '';
};

const stepLabel = computed(() => ({
    1: 'Étape 1/3 — Import clients...',
    2: 'Étape 2/3 — Import produits...',
    3: 'Étape 3/3 — Import commandes...',
}[step.value] || ''));
</script>

<template>
    <div class="import-global">
        <h1>Import Global</h1>
        <p class="subtitle">Chargez les 3 fichiers CSV — l'import se fera automatiquement en séquence.</p>

        <!-- ── ÉTAPE 0 : Upload des fichiers ── -->
        <div v-if="step === 0" class="upload-section">

            <!-- Clients -->
            <div class="file-block" :class="{ loaded: customerFile }">
                <div class="file-header">
                    <span class="badge">1</span>
                    <span>Clients <small>(nom, prenom, email, pwd)</small></span>
                    <span v-if="customerFile" class="check">Ok</span>
                </div>
                <div class="drop-zone" @click="customerInput.click()">
                    <input ref="customerInput" type="file" accept=".csv" style="display:none"
                        @change="e => onFileChange(e, 'customers')" />
                    <p>{{ customerFile ? customerFile.name : 'Choisir fichier CSV clients' }}</p>
                </div>
                <p v-if="customerRows.length" class="count">{{ customerRows.length }} client(s) détecté(s)</p>
            </div>

            <!-- Produits -->
            <div class="file-block" :class="{ loaded: productFile }">
                <div class="file-header">
                    <span class="badge">2</span>
                    <span>Produits <small>(type, sku, name, ...)</small></span>
                    <span v-if="productFile" class="check">Ok</span>
                </div>
                <div class="drop-zone" @click="productInput.click()">
                    <input ref="productInput" type="file" accept=".csv" style="display:none"
                        @change="e => onFileChange(e, 'products')" />
                    <p>{{ productFile ? productFile.name : 'Choisir fichier CSV produits' }}</p>
                </div>
                <p v-if="productRows.length" class="count">{{ productRows.length }} produit(s) détecté(s)</p>
            </div>

            <!-- Commandes -->
            <div class="file-block" :class="{ loaded: orderFile }">
                <div class="file-header">
                    <span class="badge">3</span>
                    <span>Commandes <small>(date, heure, client, achat, status)</small></span>
                    <span v-if="orderFile" class="check">Ok</span>
                </div>
                <div class="drop-zone" @click="orderInput.click()">
                    <input ref="orderInput" type="file" accept=".csv" style="display:none"
                        @change="e => onFileChange(e, 'orders')" />
                    <p>{{ orderFile ? orderFile.name : 'Choisir fichier CSV commandes' }}</p>
                </div>
                <p v-if="orderRows.length" class="count">{{ orderRows.length }} commande(s) détectée(s)</p>
            </div>

            <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

            <button
                class="btn-primary btn-launch"
                :disabled="!allFilesLoaded"
                @click="startImport"
            >
             Lancer l'import global
            </button>
        </div>

        <!-- ── ÉTAPES 1-3 : En cours ── -->
        <div v-if="step >= 1 && step <= 3" class="running-section">
            <div class="steps-indicator">
                <div v-for="s in 3" :key="s" class="step-dot" :class="{
                    active: step === s,
                    done: step > s,
                }">
                    <span>{{ s }}</span>
                </div>
            </div>

            <h2>{{ stepLabel }}</h2>
            <p class="progress-label">{{ progress.label }}</p>

            <div class="progress-bar-wrap">
                <div
                    class="progress-bar"
                    :style="{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }"
                ></div>
            </div>
            <p class="progress-count">{{ progress.current }} / {{ progress.total }}</p>

            <!-- Résultats partiels en temps réel -->
            <div v-if="step > 1 && customerResults.length" class="partial-result">
                <strong>Clients :</strong> {{ ok(customerResults) }} &nbsp;  {{ err(customerResults) }}
            </div>
            <div v-if="step > 2 && productResults.length" class="partial-result">
                <strong>Produits :</strong>  {{ ok(productResults) }} &nbsp;  {{ err(productResults) }}
            </div>
        </div>

        <!-- ── ÉTAPE 4 : Résultats finaux ── -->
        <div v-if="step === 4" class="results-section">
            <h2>Import terminé</h2>

            <!-- Résumé -->
            <div class="summary-cards">
                <div class="card">
                    <h3>Clients</h3>
                    <p class="ok">{{ ok(customerResults) }} créés</p>
                    <p class="ko"> {{ err(customerResults) }} erreurs</p>
                </div>
                <div class="card">
                    <h3>Produits</h3>
                    <p class="ok">{{ ok(productResults) }} créés</p>
                    <p class="ko"> {{ err(productResults) }} erreurs</p>
                </div>
                <div class="card">
                    <h3>Commandes</h3>
                    <p class="ok">{{ ok(orderResults) }} créées</p>
                    <p class="ko"> {{ err(orderResults) }} erreurs</p>
                </div>
            </div>

            <!-- Détail erreurs clients -->
            <details v-if="err(customerResults) > 0">
                <summary>Erreurs clients ({{ err(customerResults) }})</summary>
                <table><thead><tr><th>Email</th><th>Message</th></tr></thead>
                <tbody>
                    <tr v-for="r in customerResults.filter(r => r.status === 'error')" :key="r.email">
                        <td>{{ r.email }}</td><td>{{ r.message }}</td>
                    </tr>
                </tbody></table>
            </details>

            <!-- Détail erreurs produits -->
            <details v-if="err(productResults) > 0">
                <summary>Erreurs produits ({{ err(productResults) }})</summary>
                <table><thead><tr><th>SKU</th><th>Message</th></tr></thead>
                <tbody>
                    <tr v-for="r in productResults.filter(r => r.status === 'error')" :key="r.sku">
                        <td>{{ r.sku }}</td><td>{{ r.message }}</td>
                    </tr>
                </tbody></table>
            </details>

            <!-- Détail erreurs commandes -->
            <details v-if="err(orderResults) > 0">
                <summary>Erreurs commandes ({{ err(orderResults) }})</summary>
                <table><thead><tr><th>Référence</th><th>Message</th></tr></thead>
                <tbody>
                    <tr v-for="r in orderResults.filter(r => r.status === 'error')" :key="r.ref">
                        <td>{{ r.ref }}</td><td>{{ r.message }}</td>
                    </tr>
                </tbody></table>
            </details>

            <button class="btn-secondary" @click="reset">Nouvel import</button>
        </div>
    </div>
</template>

<style scoped>
.import-global { max-width: 800px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif; }
h1 { margin-bottom: 0.25rem; }
.subtitle { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }

/* ── Upload ── */
.upload-section { display: flex; flex-direction: column; gap: 1rem; }

.file-block { border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; transition: border-color 0.2s; }
.file-block.loaded { border-color: #22c55e; }

.file-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-weight: 600; }
.file-header small { font-weight: normal; color: #999; font-size: 0.8rem; }
.badge { background: #000; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; }
.check { margin-left: auto; }

.drop-zone { border: 2px dashed #ccc; border-radius: 6px; padding: 1rem; text-align: center; cursor: pointer; transition: border-color 0.2s; }
.drop-zone:hover { border-color: #000; }
.drop-zone p { margin: 0; font-size: 0.9rem; color: #555; }

.count { font-size: 0.8rem; color: #22c55e; margin: 0.4rem 0 0; }

.btn-launch { width: 100%; padding: 1rem; font-size: 1rem; margin-top: 0.5rem; }

/* ── Running ── */
.running-section { text-align: center; padding: 2rem 0; }

.steps-indicator { display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem; }
.step-dot { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #ccc; }
.step-dot.active { border-color: #000; color: #000; background: #000; color: #fff; }
.step-dot.done { border-color: #22c55e; background: #22c55e; color: #fff; }

.progress-label { font-size: 0.85rem; color: #666; margin: 0.5rem 0; }
.progress-count { font-size: 0.8rem; color: #999; }
.partial-result { font-size: 0.9rem; margin-top: 0.5rem; }

/* ── Results ── */
.results-section { }
.summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
.card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; text-align: center; }
.card h3 { margin: 0 0 0.5rem; font-size: 1rem; }
.ok { color: #22c55e; margin: 0.25rem 0; }
.ko { color: #ef4444; margin: 0.25rem 0; }

details { margin: 0.75rem 0; border: 1px solid #eee; border-radius: 6px; padding: 0.75rem; }
summary { cursor: pointer; font-weight: 600; }

table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; font-size: 0.85rem; }
th { background: #f5f5f5; padding: 0.4rem 0.75rem; text-align: left; border-bottom: 2px solid #ddd; }
td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #eee; }

/* ── Shared ── */
.error { color: red; margin-top: 0.5rem; }
.progress-bar-wrap { background: #f0f0f0; border-radius: 4px; height: 8px; margin: 1rem auto; max-width: 400px; }
.progress-bar { height: 8px; background: #000; border-radius: 4px; transition: width 0.3s; }

.btn-primary { background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px; padding: 0.75rem 1.5rem; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: #fff; border: 1px solid #000; cursor: pointer; border-radius: 4px; padding: 0.75rem 1.5rem; margin-top: 1.5rem; }
</style>