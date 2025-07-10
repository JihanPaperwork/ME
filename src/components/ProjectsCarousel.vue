<script setup>
import { ref, onMounted } from 'vue';
import { fetchProjectsData } from '../services/api.js'; // Import fungsi fetch

const projects = ref([]);

onMounted(async () => {
  const data = await fetchProjectsData();
  if (data) {
    projects.value = data;
  }
});
</script>

<template>
  <section class="fade-in">
    <h3 class="section-title">Proyek</h3>
    <div id="projectsCarousel" class="carousel slide shadow-lg" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div v-if="projects.length === 0" class="carousel-item active">
          <div class="card">
            <div class="card-body text-center">
              <h5 class="card-title text-primary">Tidak Ada Proyek</h5>
              <p class="card-text">Belum ada proyek yang ditambahkan.</p>
            </div>
          </div>
        </div>
        <div v-for="(project, index) in projects" :key="project.id" :class="['carousel-item', { active: index === 0 }]">
          <div class="card">
            <div class="card-body text-center">
              <h5 class="card-title text-primary">{{ project.title }}</h5>
              <p class="card-text">{{ project.description }}</p>
              <p><strong>Teknologi Digunakan:</strong> {{ project.technologies }}</p>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#projectsCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#projectsCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.carousel-item .card {
  margin: 20px auto;
  max-width: 600px;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: var(--color-primary);
  border-radius: 50%;
  padding: 15px;
}
</style>