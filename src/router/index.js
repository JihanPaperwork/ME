// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { isAuthenticated } from '../utils/auth.js'; // Import isAuthenticated

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true } // Menandai rute ini memerlukan otentikasi
    },
    { // Rute baru untuk Login
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
  ],
});

// Navigasi Guard untuk melindungi rute
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Jika rute memerlukan otentikasi dan pengguna belum login, redirect ke halaman login
    next('/login');
  } else if (to.name === 'login' && isAuthenticated.value) {
    // Jika pengguna sudah login dan mencoba ke halaman login, redirect ke dashboard
    next('/dashboard');
  } else {
    next(); // Lanjutkan navigasi
  }
});

export default router;