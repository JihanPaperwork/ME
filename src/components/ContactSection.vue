<script setup>
import { ref, onMounted } from 'vue';
import { fetchContactData } from '../services/api.js'; // Import fungsi fetch

const contactInfo = ref([]);

onMounted(async () => {
  const data = await fetchContactData();
  if (data) {
    contactInfo.value = data;
  }
});
</script>

<template>
  <section class="fade-in">
    <h3 class="section-title">Kontak & Media Sosial</h3>
    <div class="card shadow-sm">
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li v-for="contact in contactInfo" :key="contact.id" class="list-group-item">
            <strong>{{ contact.type.charAt(0).toUpperCase() + contact.type.slice(1) }}:</strong>
            <a :href="contact.url" target="_blank">{{ contact.value }}</a>
          </li>
          <li v-if="contactInfo.length === 0" class="list-group-item text-muted">
            Tidak ada informasi kontak.
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* No specific scoped styles needed */
</style>