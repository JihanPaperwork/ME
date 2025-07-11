<script setup>
import { ref, onMounted } from 'vue';
import { fetchExperienceData } from '../services/api.js'; // Import fungsi fetch

const experienceList = ref([]);

onMounted(async () => {
  const data = await fetchExperienceData();
  if (data) {
    experienceList.value = data;
  }
});
</script>

<template>
  <section class="fade-in">
    <h3 class="section-title">Pengalaman</h3>
    <div class="card shadow-sm">
      <div class="card-body" v-if="experienceList.length > 0">
        <div v-for="exp in experienceList" :key="exp.id">
          <h5 class="card-title text-primary">{{ exp.title }} di {{ exp.company }}</h5>
          <h6 class="card-subtitle mb-2 text-muted">{{ exp.duration }}</h6>
          <p class="card-text">{{ exp.description }}</p>
          <hr v-if="experienceList.length > 1 && exp !== experienceList[experienceList.length - 1]">
        </div>
      </div>
      <div class="card-body" v-else>
        <p class="card-text text-muted">Tidak ada data pengalaman.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* No specific scoped styles needed */
</style>