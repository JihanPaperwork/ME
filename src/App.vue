<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue';

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light');
};

onMounted(() => {
  // Check user's system preference on mount
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  }
});
</script>

<template>
  <nav class="navbar navbar-expand-lg" :class="{ 'navbar-dark bg-dark': isDarkMode, 'navbar-light bg-light': !isDarkMode }">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">Jihan Humaira</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/about">About</RouterLink>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#education">Pendidikan</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#skills">Skill</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#experience">Pengalaman</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#projects">Proyek</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#contact">Kontak</a>
          </li>
          <li class="nav-item ms-lg-3">
            <button class="btn btn-sm" :class="{ 'btn-outline-light': isDarkMode, 'btn-outline-dark': !isDarkMode }" @click="toggleDarkMode">
              {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <RouterView />
</template>

<style scoped>
/* Scoped styles for App.vue if needed, but most styling is global or component-specific */
</style>