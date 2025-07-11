<script setup>
import { ref, onMounted } from 'vue';
import { fetchProjectsData, createProject, updateProject, deleteProject } from '../services/api.js';

const projectList = ref([]);
const newProject = ref({
  title: '',
  description: '',
  technologies: '',
});
const editingProject = ref(null);
const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchProjects = async () => {
  loading.value = true;
  errorMessage.value = '';
  const data = await fetchProjectsData();
  if (data) {
    projectList.value = data;
  } else {
    errorMessage.value = 'Failed to load Project data.';
  }
  loading.value = false;
};

const handleAddProject = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createProject(newProject.value);
    if (result) {
      successMessage.value = 'Project added successfully!';
      newProject.value = { title: '', description: '', technologies: '' };
      await fetchProjects();
    } else {
      errorMessage.value = 'Failed to add project.';
    }
  } catch (err) {
    errorMessage.value = `Error adding project: ${err.message}`;
    console.error(err);
  }
};

const startEdit = (project) => {
  editingProject.value = { ...project };
};

const cancelEdit = () => {
  editingProject.value = null;
};

const handleUpdateProject = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateProject(editingProject.value.id, editingProject.value);
    if (result) {
      successMessage.value = 'Project updated successfully!';
      editingProject.value = null;
      await fetchProjects();
    } else {
      errorMessage.value = 'Failed to update project.';
    }
  } catch (err) {
    errorMessage.value = `Error updating project: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteProject = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      const result = await deleteProject(id);
      if (result) {
        successMessage.value = 'Project deleted successfully!';
        await fetchProjects();
      } else {
        errorMessage.value = 'Failed to delete project.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting project: ${err.message}`;
      console.error(err);
    }
  }
};

onMounted(fetchProjects);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage Projects</h4>

    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Add New Project Entry</h5>
        <form @submit.prevent="handleAddProject">
          <div class="mb-3">
            <label for="newProjTitle" class="form-label">Title:</label>
            <input type="text" id="newProjTitle" class="form-control" v-model="newProject.title" required>
          </div>
          <div class="mb-3">
            <label for="newProjDescription" class="form-label">Description:</label>
            <textarea id="newProjDescription" class="form-control" v-model="newProject.description" rows="3" required></textarea>
          </div>
          <div class="mb-3">
            <label for="newProjTechnologies" class="form-label">Technologies (comma-separated):</label>
            <input type="text" id="newProjTechnologies" class="form-control" v-model="newProject.technologies" required>
          </div>
          <button type="submit" class="btn btn-primary">Add Project</button>
        </form>
      </div>

      <div class="card shadow-sm p-4">
        <h5>Current Project Entries</h5>
        <ul class="list-group list-group-flush">
          <li v-if="projectList.length === 0" class="list-group-item text-muted">No project entries found.</li>
          <li v-for="project in projectList" :key="project.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ project.title }}</strong><br>
              <small>{{ project.description }}</small><br>
              <small class="text-muted">Tech: {{ project.technologies }}</small>
            </div>
            <div>
              <button @click="startEdit(project)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteProject(project.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="editingProject" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Project Entry</h5>
          <form @submit.prevent="handleUpdateProject">
            <div class="mb-3">
              <label for="editProjTitle" class="form-label">Title:</label>
              <input type="text" id="editProjTitle" class="form-control" v-model="editingProject.title" required>
            </div>
            <div class="mb-3">
              <label for="editProjDescription" class="form-label">Description:</label>
              <textarea id="editProjDescription" class="form-control" v-model="editingProject.description" rows="3" required></textarea>
            </div>
            <div class="mb-3">
              <label for="editProjTechnologies" class="form-label">Technologies (comma-separated):</label>
              <input type="text" id="editProjTechnologies" class="form-control" v-model="editingProject.technologies" required>
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