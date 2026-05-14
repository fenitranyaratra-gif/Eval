// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { adminAuthService } from '@/services/adminAuthServices';

import ListCategory from "@/views/Category/ListCategory.vue";
import ProductView from "@/views/Products/ListProduct.vue";
import CreateProductView from "@/views/Products/CreateProduct.vue";
import AdminDashboard from "@/views/Admin/AdminDashboard.vue";
import AdminLogin from "@/views/Admin/AdminLogin.vue";
import ImportProducts from '@/views/Products/ImportProducts.vue';
import ImportCustomers from '@/views/customers/Importcustomers.vue';
import Importorders from '@/views/Orders/Importorders.vue';
import OrdersView from '@/views/Panier/OrdersView.vue';
import AdminOrdersView from '@/views/Admin/AdminOrdersView.vue';

import Importimages from '@/views/Products/Importimages.vue';

const routes = [
    { path: "/category", component: ListCategory },
    { path: "/products", component: ProductView },
    { path: "/products/create", component: CreateProductView },
    { path: '/cart', component: () => import('@/views/Panier/CartView.vue') },
    { path: '/checkout', component: () => import('@/views/Panier/CheckoutView.vue') },
{ path: '/orders', component: () => OrdersView },
{ path: '/wishlist', component: () => import('@/views/Products/WishlistView.vue') },
{ path: '/products/:id', component: () => import('@/views/Products/ProductDetailView.vue') },
    // Admin
    { path: '/admin/login', component: AdminLogin },
    { path: '/admin/import', component: ImportProducts, meta: { requiresAdmin: true } },
    { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAdmin: true } },
    { path: '/admin/import-customers', component: ImportCustomers, meta: { requiresAdmin: true } },
    { path: '/admin/import-orders', component: Importorders, meta: { requiresAdmin: true } },
{ path: '/admin/import-images', component: Importimages, meta: { requiresAdmin: true } },
{ path: '/admin/orders', component: AdminOrdersView},
{ path: '/admin/import-global', component: () => import('@/views/Import/ImportView.vue') },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAdmin && !adminAuthService.isLoggedIn()) {
        next('/admin/login');
    } else {
        next();
    }
});

export default router;