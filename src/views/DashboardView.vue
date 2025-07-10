<script setup>
import { ref, onMounted } from 'vue';
// UBAH BARIS INI:
import { fetchDashboardData } from '../services/api.js'; // Mengimpor fetchDashboardData

const dashboardData = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // UBAH PANGGILAN FUNGSI INI:
    const result = await fetchDashboardData(); // Memanggil fetchDashboardData
    if (result) {
      dashboardData.value = result; // Pastikan ini result langsung, karena backend mengembalikan array data
    } else {
      error.value = 'Failed to fetch dashboard data.';
    }
  } catch (err) {
    error.value = 'An error occurred while fetching data.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard container py-5">
    <h1 class="section-title">Dashboard</h1>
    <div v-if="loading" class="text-center">Loading dashboard data...</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <aside class="col-md-3 sidebar">
        <div class="card shadow-sm mb-4">
          <div class="card-header">Navigation</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><a href="#" class="sidebar-link">Overview</a></li>
            <li class="list-group-item"><a href="#" class="sidebar-link">Analytics</a></li>
            <li class="list-group-item"><a href="#" class="sidebar-link">Settings</a></li>
          </ul>
        </div>
      </aside>

      <main class="col-md-9 main-content">
        <div class="row">
          <div v-for="item in dashboardData" :key="item.id" class="col-md-6 col-lg-4 mb-4">
            <div class="card card-dashboard shadow-sm">
              <div class="card-body">
                <h5 class="card-title text-primary">{{ item.title }}</h5>
                <p class="card-text display-4 fw-bold">{{ item.value }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!loading && !error && (!dashboardData || dashboardData.length === 0)" class="alert alert-info mt-3">
          No dashboard data available. Please ensure your `dashboard_info` table has data.
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Specific styles for DashboardView.vue */
.dashboard {
  min-height: 100vh;
}

.sidebar {
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  padding-right: 15px;
}

.sidebar .card-header {
  background-color: var(--color-primary);
  color: var(--color-text-dark);
  font-weight: bold;
}

.sidebar-link {
  display: block;
  padding: 8px 0;
  color: var(--color-text);
}

.sidebar-link:hover {
  color: var(--color-primary);
  background-color: var(--color-background-mute);
}

.main-content {
  padding-left: 15px;
}

.card-dashboard {
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
}

.card-dashboard:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>