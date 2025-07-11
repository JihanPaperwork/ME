<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../services/api.js'; // Akan kita buat di api.js
import { isAuthenticated, setAuthToken, clearAuth } from '../utils/auth.js'; // Akan kita buat

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = ''; // Clear previous errors

  const token = await loginUser(username.value, password.value);

  if (token) {
    setAuthToken(token); // Simpan token
    router.push('/dashboard'); // Redirect ke dashboard
  } else {
    errorMessage.value = 'Invalid username or password.';
    clearAuth(); // Pastikan status auth bersih jika login gagal
  }
};
</script>

<template>
  <div class="login-container d-flex justify-content-center align-items-center vh-100 fade-in">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%;">
      <div class="card-body">
        <h3 class="card-title text-center section-title mb-4">Login Admin</h3>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label">Username:</label>
            <input type="text" id="username" class="form-control" v-model="username" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input type="password" id="password" class="form-control" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-3">Login</button>
          <div v-if="errorMessage" class="alert alert-danger text-center">
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background-color: var(--color-background);
}
.section-title {
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 10px;
  margin-bottom: 30px;
  color: var(--color-heading);
  font-weight: bold;
}
.card-body {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}
.form-control {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-color: var(--color-border);
}
.form-control:focus {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}
.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-primary:hover {
  background-color: #0056b3; /* Darker blue on hover */
  border-color: #0056b3;
}
</style>