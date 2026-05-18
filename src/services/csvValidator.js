// services/csvValidator.js

const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

// ── Colonnes attendues par type ──
const EXPECTED_COLUMNS = {
    products: ['type', 'sku', 'name', 'prix_vente', 'prix_achat', 'stock_initial', 'Categorie'],
    customers: ['nom', 'prenom', 'email', 'pwd'],
    orders: ['date', 'heure', 'client', 'achat', 'status'],
};

const VALID_STATUSES = ['pending', 'completed', 'processing', 'canceled'];

// ── Validation colonnes ──
const validateColumns = (headers, type) => {
    const expected = EXPECTED_COLUMNS[type];
    const missing = expected.filter(col => !headers.includes(col));
    const errors = [];
    if (missing.length) {
        errors.push({
            row: 0,
            field: 'colonnes',
            message: `Colonnes manquantes : ${missing.join(', ')}`
        });
    }
    return errors;
};

// ── Validation produits ──
const validateProducts = (rows, headers) => {
    const errors = [...validateColumns(headers, 'products')];
    if (errors.length) return errors;

    rows.forEach((row, i) => {
        const rowNum = i + 2;

        if (!row.sku?.trim()) {
            errors.push({ row: rowNum, field: 'sku', message: 'SKU vide' });
        }
        if (!row.name?.trim()) {
            errors.push({ row: rowNum, field: 'name', message: 'Nom vide' });
        }
        const prix = parseFloat(row.prix_vente);
        if (isNaN(prix) || prix <= 0) {
            errors.push({ row: rowNum, field: 'prix_vente', message: `Prix vente invalide ou non positif : "${row.prix_vente}"` });
        }
        const achat = parseFloat(row.prix_achat);
        if (isNaN(achat) || achat <= 0) {
            errors.push({ row: rowNum, field: 'prix_achat', message: `Prix achat invalide ou non positif : "${row.prix_achat}"` });
        }
        const stock = parseInt(row.stock_initial);
        if (isNaN(stock) || stock < 0) {
            errors.push({ row: rowNum, field: 'stock_initial', message: `Stock invalide : "${row.stock_initial}"` });
        }
        if (row.prix_promo) {
            const promo = parseFloat(row.prix_promo);
            if (isNaN(promo) || promo <= 0) {
                errors.push({ row: rowNum, field: 'prix_promo', message: `Prix promo invalide ou non positif : "${row.prix_promo}"` });
            }
        }
    });

    return errors;
};

// ── Validation clients ──
const validateCustomers = (rows, headers) => {
    const errors = [...validateColumns(headers, 'customers')];
    if (errors.length) return errors;

    const emails = new Set();
    rows.forEach((row, i) => {
        const rowNum = i + 2;

        if (!row.nom?.trim()) {
            errors.push({ row: rowNum, field: 'nom', message: 'Nom vide' });
        }
        if (!row.prenom?.trim()) {
            errors.push({ row: rowNum, field: 'prenom', message: 'Prénom vide' });
        }
        if (!row.email?.includes('@')) {
            errors.push({ row: rowNum, field: 'email', message: `Email invalide : "${row.email}"` });
        }
        if (emails.has(row.email)) {
            errors.push({ row: rowNum, field: 'email', message: `Email en double : "${row.email}"` });
        }
        emails.add(row.email);
        if (!row.pwd || row.pwd.length < 6) {
            errors.push({ row: rowNum, field: 'pwd', message: `Mot de passe trop court (min 6 caractères)` });
        }
    });

    return errors;
};

// ── Validation commandes ──
const validateOrders = (rows, headers) => {
    const errors = [...validateColumns(headers, 'orders')];
    if (errors.length) return errors;

    rows.forEach((row, i) => {
        const rowNum = i + 2;

        // Date format DD/MM/YYYY
        if (!DATE_REGEX.test(row.date)) {
            errors.push({ row: rowNum, field: 'date', message: `Format date invalide : "${row.date}" (attendu DD/MM/YYYY)` });
        } else {
            const [day, month, year] = row.date.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                errors.push({ row: rowNum, field: 'date', message: `Date inexistante : "${row.date}"` });
            }
        }

        // Heure format HH:MM
        if (!TIME_REGEX.test(row.heure)) {
            errors.push({ row: rowNum, field: 'heure', message: `Format heure invalide : "${row.heure}" (attendu HH:MM)` });
        }

        // Email client
        if (!row.client?.includes('@')) {
            errors.push({ row: rowNum, field: 'client', message: `Email client invalide : "${row.client}"` });
        }

        // Achat non vide
        if (!row.achat?.trim()) {
            errors.push({ row: rowNum, field: 'achat', message: 'Champ achat vide' });
        }

        // Status valide
        if (!VALID_STATUSES.includes(row.status?.trim())) {
            errors.push({ row: rowNum, field: 'status', message: `Statut invalide : "${row.status}" (attendu : ${VALID_STATUSES.join(', ')})` });
        }
    });

    return errors;
};

export const csvValidator = {
    validateProducts(rows, headers) {
        return validateProducts(rows, headers);
    },
    validateCustomers(rows, headers) {
        return validateCustomers(rows, headers);
    },
    validateOrders(rows, headers) {
        return validateOrders(rows, headers);
    }
};