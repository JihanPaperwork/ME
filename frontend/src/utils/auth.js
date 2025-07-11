// src/utils/auth.js
import { ref } from 'vue';

// Gunakan reactive state di App.vue untuk status global
export const isAuthenticated = ref(!!localStorage.getItem('token'));

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  isAuthenticated.value = true;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  isAuthenticated.value = false;
};