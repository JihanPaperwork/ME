<script setup>
import { ref, onMounted } from 'vue';
import { fetchAboutMeData, updateAboutMe } from '../services/api.js';

const aboutMe = ref({
  id: null,
  name: '',
  title: '',
  description: '',
  profile_pic_url: '',
});
const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchAbout = async () => {
  loading.value = true;
  errorMessage.value = '';
  const data = await fetchAboutMeData();
  if (data) {
    aboutMe.value = data;
  } else {
    errorMessage.value = 'Failed to load About Me data. Please create a new entry.';
    // Initialize with empty data for new entry if none exists
    aboutMe.value = { id: null, name: '', title: '', description: '', profile_pic_url: '' };
  }
  loading.value = false;
};

const handleSave = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    let result;
    if (aboutMe.value.id) {
      result = await updateAboutMe(aboutMe.value.id, aboutMe.value);
    } else {
      // If no ID, it means it's a new entry (About Me usually has only one)
      // For simplicity, we're forcing update if ID exists, otherwise, show error or guide.
      // In a real app, you'd handle multiple entries or force single entry better.
      errorMessage.value = 'Cannot create new About Me entry. Please update the existing one.';
      return;
    }

    if (result) {
      successMessage.value = 'About Me data saved successfully!';
      await fetchAbout(); // Refresh data
    } else {
      errorMessage.value = 'Failed to save About Me data.';
    }
  } catch (err) {
    errorMessage.value = `Error saving data: ${err.message}`;
    console.error(err);
  }
};

onMounted(fetchAbout);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage About Me</h4>
    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else class="card shadow-sm p-4">
      <form @submit.prevent="handleSave">
        <div class="mb-3">
          <label for="name" class="form-label">Name:</label>
          <input type="text" id="name" class="form-control" v-model="aboutMe.name" required>
        </div>
        <div class="mb-3">
          <label for="title" class="form-label">Title:</label>
          <input type="text" id="title" class="form-control" v-model="aboutMe.title" required>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description:</label>
          <textarea id="description" class="form-control" v-model="aboutMe.description" rows="5"></textarea>
        </div>
        <div class="mb-3">
          <label for="profile_pic_url" class="form-label">Profile Picture URL:</label>
          <input type="text" id="profile_pic_url" class="form-control" v-model="aboutMe.profile_pic_url">
        </div>
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      </form>
    </div>
  </div>
</template>