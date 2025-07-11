<script setup>
import { ref, onMounted } from 'vue';
import { fetchExperienceData, createExperience, updateExperience, deleteExperience } from '../services/api.js';

const experienceList = ref([]);
const newExperience = ref({
  title: '',
  company: '',
  duration: '',
  description: '',
});
const editingExperience = ref(null);
const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchExperience = async () => {
  loading.value = true;
  errorMessage.value = '';
  const data = await fetchExperienceData();
  if (data) {
    experienceList.value = data;
  } else {
    errorMessage.value = 'Failed to load Experience data.';
  }
  loading.value = false;
};

const handleAddExperience = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createExperience(newExperience.value);
    if (result) {
      successMessage.value = 'Experience entry added successfully!';
      newExperience.value = { title: '', company: '', duration: '', description: '' };
      await fetchExperience();
    } else {
      errorMessage.value = 'Failed to add experience entry.';
    }
  } catch (err) {
    errorMessage.value = `Error adding entry: ${err.message}`;
    console.error(err);
  }
};

const startEdit = (exp) => {
  editingExperience.value = { ...exp };
};

const cancelEdit = () => {
  editingExperience.value = null;
};

const handleUpdateExperience = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateExperience(editingExperience.value.id, editingExperience.value);
    if (result) {
      successMessage.value = 'Experience entry updated successfully!';
      editingExperience.value = null;
      await fetchExperience();
    } else {
      errorMessage.value = 'Failed to update experience entry.';
    }
  } catch (err) {
    errorMessage.value = `Error updating entry: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteExperience = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this experience entry?')) {
    try {
      const result = await deleteExperience(id);
      if (result) {
        successMessage.value = 'Experience entry deleted successfully!';
        await fetchExperience();
      } else {
        errorMessage.value = 'Failed to delete experience entry.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting entry: ${err.message}`;
      console.error(err);
    }
  }
};

onMounted(fetchExperience);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage Experience</h4>

    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Add New Experience Entry</h5>
        <form @submit.prevent="handleAddExperience">
          <div class="mb-3">
            <label for="newExpTitle" class="form-label">Title:</label>
            <input type="text" id="newExpTitle" class="form-control" v-model="newExperience.title" required>
          </div>
          <div class="mb-3">
            <label for="newExpCompany" class="form-label">Company:</label>
            <input type="text" id="newExpCompany" class="form-control" v-model="newExperience.company" required>
          </div>
          <div class="mb-3">
            <label for="newExpDuration" class="form-label">Duration:</label>
            <input type="text" id="newExpDuration" class="form-control" v-model="newExperience.duration" required>
          </div>
          <div class="mb-3">
            <label for="newExpDescription" class="form-label">Description:</label>
            <textarea id="newExpDescription" class="form-control" v-model="newExperience.description" rows="3" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Add Experience</button>
        </form>
      </div>

      <div class="card shadow-sm p-4">
        <h5>Current Experience Entries</h5>
        <ul class="list-group list-group-flush">
          <li v-if="experienceList.length === 0" class="list-group-item text-muted">No experience entries found.</li>
          <li v-for="exp in experienceList" :key="exp.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ exp.title }}</strong> at {{ exp.company }} ({{ exp.duration }})
            </div>
            <div>
              <button @click="startEdit(exp)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteExperience(exp.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="editingExperience" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Experience Entry</h5>
          <form @submit.prevent="handleUpdateExperience">
            <div class="mb-3">
              <label for="editExpTitle" class="form-label">Title:</label>
              <input type="text" id="editExpTitle" class="form-control" v-model="editingExperience.title" required>
            </div>
            <div class="mb-3">
              <label for="editExpCompany" class="form-label">Company:</label>
              <input type="text" id="editExpCompany" class="form-control" v-model="editingExperience.company" required>
            </div>
            <div class="mb-3">
              <label for="editExpDuration" class="form-label">Duration:</label>
              <input type="text" id="editExpDuration" class="form-control" v-model="editingExperience.duration" required>
            </div>
            <div class="mb-3">
              <label for="editExpDescription" class="form-label">Description:</label>
              <textarea id="editExpDescription" class="form-control" v-model="editingExperience.description" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary me-2">Update</button>
            <button type="button" @click="cancelEdit" class="btn btn-secondary">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
.modal-content {
  background-color: var(--color-background-soft);
  color: var(--color-text);
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
</style>