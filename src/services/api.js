// src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';
import { getAuthToken, clearAuth } from '../utils/auth.js'; // Import fungsi otentikasi

const fetchWrapper = async (endpoint) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
      headers['x-auth-token'] = token; // Tambahkan token ke header
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Jika token tidak valid atau tidak diotorisasi, logout pengguna
      clearAuth();
      // Opsional: Redirect ke halaman login jika Anda ingin otomatis
      // window.location.href = '/login';
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error message
      throw new Error(`HTTP error! status: ${response.status} from ${endpoint}: ${errorData.msg || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    return null;
  }
};

export const fetchDashboardData = () => fetchWrapper('dashboard');
export const fetchAboutMeData = () => fetchWrapper('about');
export const fetchEducationData = () => fetchWrapper('education');
export const fetchSkillsData = () => fetchWrapper('skills');
export const fetchExperienceData = () => fetchWrapper('experience');
export const fetchProjectsData = () => fetchWrapper('projects');
export const fetchContactData = () => fetchWrapper('contact');

// Fungsi baru untuk Login
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed:', errorData.msg);
      return null;
    }

    const data = await response.json();
    return data.token; // Mengembalikan token
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
};