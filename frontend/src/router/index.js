// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '../views/DashboardView.vue'; // Import DashboardView directly here
import { isAuthenticated } from '../utils/auth.js';

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
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView, // Use imported DashboardView
      meta: { requiresAuth: true },
      children: [
        // Default child route for overview (optional, if you want a separate component for it)
        // { path: '', name: 'dashboard-overview', component: () => import('../components/DashboardOverview.vue') },
        { path: 'about', name: 'dashboard-about', component: () => import('../components/DashboardAbout.vue'), meta: { requiresAuth: true } },
        { path: 'education', name: 'dashboard-education', component: () => import('../components/DashboardEducation.vue'), meta: { requiresAuth: true } },
        { path: 'skills', name: 'dashboard-skills', component: () => import('../components/DashboardSkills.vue'), meta: { requiresAuth: true } },
        { path: 'experience', name: 'dashboard-experience', component: () => import('../components/DashboardExperience.vue'), meta: { requiresAuth: true } },
        { path: 'projects', name: 'dashboard-projects', component: () => import('../components/DashboardProjects.vue'), meta: { requiresAuth: true } },
        { path: 'contact', name: 'dashboard-contact', component: () => import('../components/DashboardContact.vue'), meta: { requiresAuth: true } },
      ]
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login');
  } else if (to.name === 'login' && isAuthenticated.value) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;