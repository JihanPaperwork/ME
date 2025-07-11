<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';
import { fetchDashboardData } from '../services/api.js';

const dashboardOverviewData = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const result = await fetchDashboardData();
    if (result) {
      dashboardOverviewData.value = result;
    } else {
      error.value = 'Failed to fetch dashboard overview data.';
    }
  } catch (err) {
    error.value = 'An error occurred while fetching overview data.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="dashboard-layout container-fluid py-5">
    <div class="row">
      <aside class="col-md-3 sidebar">
        <div class="card shadow-sm mb-4">
          <div class="card-header">Dashboard Menu</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <RouterLink to="/dashboard" class="sidebar-link">Overview</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/about" class="sidebar-link">About Me</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/education" class="sidebar-link">Education</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/skills" class="sidebar-link">Skills</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/experience" class="sidebar-link">Experience</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/projects" class="sidebar-link">Projects</RouterLink>
            </li>
            <li class="list-group-item">
              <RouterLink to="/dashboard/contact" class="sidebar-link">Contact Info</RouterLink>
            </li>
          </ul>
        </div>
      </aside>

      <main class="col-md-9 main-content">
        <h1 class="section-title">Dashboard</h1>
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <KeepAlive>
              <Suspense>
                <component :is="Component"></component>
                <template #fallback>
                  <div class="text-center mt-5">Loading sub-section...</div>
                </template>
              </Suspense>
            </KeepAlive>
          </template>
          <template v-else>
            <h3 class="mt-4">Overview</h3>
            <div v-if="loading" class="text-center">Loading dashboard data...</div>
            <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else class="row">
              <div v-for="item in dashboardOverviewData" :key="item.id" class="col-md-6 col-lg-4 mb-4">
                <div class="card card-dashboard shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title text-primary">{{ item.title }}</h5>
                    <p class="card-text display-4 fw-bold">{{ item.value }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!loading && !error && (!dashboardOverviewData || dashboardOverviewData.length === 0)" class="alert alert-info mt-3">
              No dashboard overview data available. Please ensure your `dashboard_info` table has data.
            </div>
          </template>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.row {
  flex-grow: 1;
}

.sidebar {
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  padding: 15px;
}

.sidebar .card-header {
  background-color: var(--color-primary);
  color: var(--color-text-dark);
  font-weight: bold;
}

.sidebar-link {
  display: block;
  padding: 8px 10px;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-link:hover,
.router-link-active.sidebar-link {
  background-color: var(--color-primary);
  color: var(--color-text-dark);
}

.main-content {
  padding: 15px;
  background-color: var(--color-background);
}

.section-title {
  border-bottom: 2px solid var(--color-border);
  margin-bottom: 30px;
  padding-bottom: 10px;
  color: var(--color-heading);
  text-align: left; /* Adjusted for dashboard content */
  font-weight: bold;
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