<script setup>
defineProps(['errors', 'type']);
</script>

<template>
    <div class="validation-box" v-if="errors.length">
        <h3>{{ errors.length }} erreur(s) détectée(s) — Corrigez le CSV avant d'importer</h3>
        <table>
            <thead>
                <tr>
                    <th>Ligne</th>
                    <th>Champ</th>
                    <th>Erreur</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(err, i) in errors" :key="i">
                    <td>{{ err.row === 0 ? 'En-tête' : `Ligne ${err.row}` }}</td>
                    <td><code>{{ err.field }}</code></td>
                    <td>{{ err.message }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="validation-ok" v-else-if="errors !== null">
        CSV valide — prêt à importer
    </div>
</template>

<style scoped>
.validation-box { background: #fff0f0; border: 1px solid #f44336; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
.validation-box h3 { color: #c62828; margin: 0 0 0.75rem; }
.validation-ok { background: #f0fff4; border: 1px solid #4caf50; border-radius: 8px; padding: 1rem; margin: 1rem 0; color: #2e7d32; }
table { width: 100%; border-collapse: collapse; }
th { background: #fde8e8; padding: 0.5rem; text-align: left; }
td { padding: 0.5rem; border-bottom: 1px solid #fcc; }
code { background: #eee; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>