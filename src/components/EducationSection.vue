<script setup>
import { ref, onMounted } from 'vue';
import { fetchEducationData } from '../services/api.js'; // Import fungsi fetch

const educationList = ref([]);

onMounted(async () => {
  const data = await fetchEducationData();
  if (data) {
    educationList.value = data;
  }
});
</script>

<template>
  <section class="fade-in">
    <h3 class="section-title">Pendidikan</h3>
    <div class="card shadow-sm">
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li v-for="edu in educationList" :key="edu.id" class="list-group-item">
            <strong>{{ edu.institution }}</strong><br>
            {{ edu.degree }}<br>
            {{ edu.years }}
          </li>
          <li v-if="educationList.length === 0" class="list-group-item text-muted">
            Tidak ada data pendidikan.
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* No specific scoped styles needed */
</style>