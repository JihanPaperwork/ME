<script setup>
import { ref, onMounted } from 'vue';
import { fetchSkillsData } from '../services/api.js';

const skillsData = ref({});

onMounted(async () => {
  const data = await fetchSkillsData();
  if (data) {
    skillsData.value = data;
  }
});
</script>

<template>
  <section class="fade-in">
    <h3 class="section-title">Skill</h3>
    <div class="card shadow-sm">
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li v-for="(skills, category) in skillsData" :key="category" class="list-group-item">
            <strong>{{ category }}:</strong>
            {{ skills.map(skill => skill.name).join(', ') }}
          </li>
          <li v-if="Object.keys(skillsData).length === 0" class="list-group-item text-muted">
            Tidak ada data skill.
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* No specific scoped styles needed */
</style>