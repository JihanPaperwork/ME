<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchSkillCategories, createSkillCategory, updateSkillCategory, deleteSkillCategory,
  fetchIndividualSkills, createIndividualSkill, updateIndividualSkill, deleteIndividualSkill
} from '../services/api.js';

const categories = ref([]);
const skills = ref([]); // Individual skills with category_name
const newCategoryName = ref('');
const newSkill = ref({ name: '', category_id: '' });

const editingCategory = ref(null);
const editingSkill = ref(null);

const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchAllData = async () => {
  loading.value = true;
  errorMessage.value = '';
  const categoriesData = await fetchSkillCategories();
  const skillsData = await fetchIndividualSkills();

  if (categoriesData) {
    categories.value = categoriesData;
  } else {
    errorMessage.value = 'Failed to load skill categories.';
  }

  if (skillsData) {
    skills.value = skillsData;
  } else {
    errorMessage.value = 'Failed to load individual skills.';
  }
  loading.value = false;
};

// --- Category Management ---
const handleAddCategory = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createSkillCategory({ name: newCategoryName.value });
    if (result) {
      successMessage.value = 'Skill category added successfully!';
      newCategoryName.value = '';
      await fetchAllData();
    } else {
      errorMessage.value = 'Failed to add skill category.';
    }
  } catch (err) {
    errorMessage.value = `Error adding category: ${err.message}`;
    console.error(err);
  }
};

const startEditCategory = (category) => {
  editingCategory.value = { ...category };
};

const cancelEditCategory = () => {
  editingCategory.value = null;
};

const handleUpdateCategory = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateSkillCategory(editingCategory.value.id, { name: editingCategory.value.name });
    if (result) {
      successMessage.value = 'Skill category updated successfully!';
      editingCategory.value = null;
      await fetchAllData();
    } else {
      errorMessage.value = 'Failed to update skill category.';
    }
  } catch (err) {
    errorMessage.value = `Error updating category: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteCategory = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this category? All skills under it will be affected or become orphaned (depending on DB).')) {
    try {
      const result = await deleteSkillCategory(id);
      if (result) {
        successMessage.value = 'Skill category deleted successfully!';
        await fetchAllData();
      } else {
        errorMessage.value = 'Failed to delete skill category.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting category: ${err.message}`;
      console.error(err);
    }
  }
};

// --- Skill Management ---
const handleAddSkill = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createIndividualSkill(newSkill.value);
    if (result) {
      successMessage.value = 'Skill added successfully!';
      newSkill.value = { name: '', category_id: '' };
      await fetchAllData();
    } else {
      errorMessage.value = 'Failed to add skill.';
    }
  } catch (err) {
    errorMessage.value = `Error adding skill: ${err.message}`;
    console.error(err);
  }
};

const startEditSkill = (skill) => {
  editingSkill.value = { ...skill };
};

const cancelEditSkill = () => {
  editingSkill.value = null;
};

const handleUpdateSkill = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateIndividualSkill(editingSkill.value.id, { name: editingSkill.value.name, category_id: editingSkill.value.category_id });
    if (result) {
      successMessage.value = 'Skill updated successfully!';
      editingSkill.value = null;
      await fetchAllData();
    } else {
      errorMessage.value = 'Failed to update skill.';
    }
  } catch (err) {
    errorMessage.value = `Error updating skill: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteSkill = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this skill?')) {
    try {
      const result = await deleteIndividualSkill(id);
      if (result) {
        successMessage.value = 'Skill deleted successfully!';
        await fetchAllData();
      } else {
        errorMessage.value = 'Failed to delete skill.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting skill: ${err.message}`;
      console.error(err);
    }
  }
};

onMounted(fetchAllData);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage Skills</h4>

    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Skill Categories</h5>
        <form @submit.prevent="handleAddCategory" class="mb-3">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="New Category Name" v-model="newCategoryName" required>
            <button type="submit" class="btn btn-primary">Add Category</button>
          </div>
        </form>
        <ul class="list-group mb-3">
          <li v-if="categories.length === 0" class="list-group-item text-muted">No categories found.</li>
          <li v-for="category in categories" :key="category.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ category.name }}
            <div>
              <button @click="startEditCategory(category)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteCategory(category.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Individual Skills</h5>
        <form @submit.prevent="handleAddSkill" class="mb-3">
          <div class="row g-3">
            <div class="col-md-6">
              <input type="text" class="form-control" placeholder="Skill Name" v-model="newSkill.name" required>
            </div>
            <div class="col-md-4">
              <select class="form-select" v-model="newSkill.category_id" required>
                <option value="">Select Category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary w-100">Add Skill</button>
            </div>
          </div>
        </form>
        <ul class="list-group">
          <li v-if="skills.length === 0" class="list-group-item text-muted">No skills found.</li>
          <li v-for="skill in skills" :key="skill.id" class="list-group-item d-flex justify-content-between align-items-center">
            {{ skill.name }} ({{ skill.category_name }})
            <div>
              <button @click="startEditSkill(skill)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteSkill(skill.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="editingCategory" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Skill Category</h5>
          <form @submit.prevent="handleUpdateCategory">
            <div class="mb-3">
              <label for="editCategoryName" class="form-label">Category Name:</label>
              <input type="text" id="editCategoryName" class="form-control" v-model="editingCategory.name" required>
            </div>
            <button type="submit" class="btn btn-primary me-2">Update</button>
            <button type="button" @click="cancelEditCategory" class="btn btn-secondary">Cancel</button>
          </form>
        </div>
      </div>

      <div v-if="editingSkill" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Skill</h5>
          <form @submit.prevent="handleUpdateSkill">
            <div class="mb-3">
              <label for="editSkillName" class="form-label">Skill Name:</label>
              <input type="text" id="editSkillName" class="form-control" v-model="editingSkill.name" required>
            </div>
            <div class="mb-3">
              <label for="editSkillCategory" class="form-label">Category:</label>
              <select id="editSkillCategory" class="form-select" v-model="editingSkill.category_id" required>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary me-2">Update</button>
            <button type="button" @click="cancelEditSkill" class="btn btn-secondary">Cancel</button>
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