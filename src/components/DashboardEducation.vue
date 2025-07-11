<script setup>
import { ref, onMounted } from 'vue';
import { fetchEducationData, createEducation, updateEducation, deleteEducation } from '../services/api.js';

const educationList = ref([]);
const newEducation = ref({
  institution: '',
  degree: '',
  years: '',
});
const editingEducation = ref(null);
const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchEducation = async () => {
  loading.value = true;
  errorMessage.value = '';
  const data = await fetchEducationData();
  if (data) {
    educationList.value = data;
  } else {
    errorMessage.value = 'Failed to load Education data.';
  }
  loading.value = false;
};

const handleAddEducation = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createEducation(newEducation.value);
    if (result) {
      successMessage.value = 'Education entry added successfully!';
      newEducation.value = { institution: '', degree: '', years: '' }; // Clear form
      await fetchEducation(); // Refresh list
    } else {
      errorMessage.value = 'Failed to add education entry.';
    }
  } catch (err) {
    errorMessage.value = `Error adding entry: ${err.message}`;
    console.error(err);
  }
};

const startEdit = (edu) => {
  editingEducation.value = { ...edu }; // Create a copy for editing
};

const cancelEdit = () => {
  editingEducation.value = null;
};

const handleUpdateEducation = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateEducation(editingEducation.value.id, editingEducation.value);
    if (result) {
      successMessage.value = 'Education entry updated successfully!';
      editingEducation.value = null; // Exit edit mode
      await fetchEducation(); // Refresh list
    } else {
      errorMessage.value = 'Failed to update education entry.';
    }
  } catch (err) {
    errorMessage.value = `Error updating entry: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteEducation = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this education entry?')) {
    try {
      const result = await deleteEducation(id);
      if (result) {
        successMessage.value = 'Education entry deleted successfully!';
        await fetchEducation(); // Refresh list
      } else {
        errorMessage.value = 'Failed to delete education entry.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting entry: ${err.message}`;
      console.error(err);
    }
  }
};

onMounted(fetchEducation);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage Education</h4>

    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Add New Education Entry</h5>
        <form @submit.prevent="handleAddEducation">
          <div class="mb-3">
            <label for="newInstitution" class="form-label">Institution:</label>
            <input type="text" id="newInstitution" class="form-control" v-model="newEducation.institution" required>
          </div>
          <div class="mb-3">
            <label for="newDegree" class="form-label">Degree:</label>
            <input type="text" id="newDegree" class="form-control" v-model="newEducation.degree" required>
          </div>
          <div class="mb-3">
            <label for="newYears" class="form-label">Years:</label>
            <input type="text" id="newYears" class="form-control" v-model="newEducation.years" required>
          </div>
          <button type="submit" class="btn btn-primary">Add Education</button>
        </form>
      </div>

      <div class="card shadow-sm p-4">
        <h5>Current Education Entries</h5>
        <ul class="list-group list-group-flush">
          <li v-if="educationList.length === 0" class="list-group-item text-muted">No education entries found.</li>
          <li v-for="edu in educationList" :key="edu.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ edu.institution }}</strong> - {{ edu.degree }} ({{ edu.years }})
            </div>
            <div>
              <button @click="startEdit(edu)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteEducation(edu.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="editingEducation" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Education Entry</h5>
          <form @submit.prevent="handleUpdateEducation">
            <div class="mb-3">
              <label for="editInstitution" class="form-label">Institution:</label>
              <input type="text" id="editInstitution" class="form-control" v-model="editingEducation.institution" required>
            </div>
            <div class="mb-3">
              <label for="editDegree" class="form-label">Degree:</label>
              <input type="text" id="editDegree" class="form-control" v-model="editingEducation.degree" required>
            </div>
            <div class="mb-3">
              <label for="editYears" class="form-label">Years:</label>
              <input type="text" id="editYears" class="form-control" v-model="editingEducation.years" required>
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
  z-index: 1050; /* Above Bootstrap nav */
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