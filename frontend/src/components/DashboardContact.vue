<script setup>
import { ref, onMounted } from 'vue';
import { fetchContactData, createContact, updateContact, deleteContact } from '../services/api.js';

const contactList = ref([]);
const newContact = ref({
  type: '',
  value: '',
  url: '',
});
const editingContact = ref(null);
const loading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');

const fetchContact = async () => {
  loading.value = true;
  errorMessage.value = '';
  const data = await fetchContactData();
  if (data) {
    contactList.value = data;
  } else {
    errorMessage.value = 'Failed to load Contact Info data.';
  }
  loading.value = false;
};

const handleAddContact = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await createContact(newContact.value);
    if (result) {
      successMessage.value = 'Contact entry added successfully!';
      newContact.value = { type: '', value: '', url: '' };
      await fetchContact();
    } else {
      errorMessage.value = 'Failed to add contact entry.';
    }
  } catch (err) {
    errorMessage.value = `Error adding entry: ${err.message}`;
    console.error(err);
  }
};

const startEdit = (contact) => {
  editingContact.value = { ...contact };
};

const cancelEdit = () => {
  editingContact.value = null;
};

const handleUpdateContact = async () => {
  successMessage.value = '';
  errorMessage.value = '';
  try {
    const result = await updateContact(editingContact.value.id, editingContact.value);
    if (result) {
      successMessage.value = 'Contact entry updated successfully!';
      editingContact.value = null;
      await fetchContact();
    } else {
      errorMessage.value = 'Failed to update contact entry.';
    }
  } catch (err) {
    errorMessage.value = `Error updating entry: ${err.message}`;
    console.error(err);
  }
};

const handleDeleteContact = async (id) => {
  successMessage.value = '';
  errorMessage.value = '';
  if (confirm('Are you sure you want to delete this contact entry?')) {
    try {
      const result = await deleteContact(id);
      if (result) {
        successMessage.value = 'Contact entry deleted successfully!';
        await fetchContact();
      } else {
        errorMessage.value = 'Failed to delete contact entry.';
      }
    } catch (err) {
      errorMessage.value = `Error deleting entry: ${err.message}`;
      console.error(err);
    }
  }
};

onMounted(fetchContact);
</script>

<template>
  <div class="dashboard-section">
    <h4>Manage Contact Info</h4>

    <div v-if="loading" class="text-center py-4">Loading...</div>
    <div v-else>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

      <div class="card shadow-sm p-4 mb-4">
        <h5>Add New Contact Entry</h5>
        <form @submit.prevent="handleAddContact">
          <div class="mb-3">
            <label for="newContactType" class="form-label">Type (e.g., Email, LinkedIn, GitHub):</label>
            <input type="text" id="newContactType" class="form-control" v-model="newContact.type" required>
          </div>
          <div class="mb-3">
            <label for="newContactValue" class="form-label">Value (e.g., email@example.com, @username):</label>
            <input type="text" id="newContactValue" class="form-control" v-model="newContact.value" required>
          </div>
          <div class="mb-3">
            <label for="newContactUrl" class="form-label">URL (optional):</label>
            <input type="text" id="newContactUrl" class="form-control" v-model="newContact.url">
          </div>
          <button type="submit" class="btn btn-primary">Add Contact</button>
        </form>
      </div>

      <div class="card shadow-sm p-4">
        <h5>Current Contact Entries</h5>
        <ul class="list-group list-group-flush">
          <li v-if="contactList.length === 0" class="list-group-item text-muted">No contact entries found.</li>
          <li v-for="contact in contactList" :key="contact.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ contact.type }}:</strong> {{ contact.value }}
              <br v-if="contact.url">
              <a v-if="contact.url" :href="contact.url" target="_blank" class="text-muted small">{{ contact.url }}</a>
            </div>
            <div>
              <button @click="startEdit(contact)" class="btn btn-sm btn-info me-2">Edit</button>
              <button @click="handleDeleteContact(contact.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="editingContact" class="modal-overlay">
        <div class="modal-content card p-4 shadow-lg">
          <h5>Edit Contact Entry</h5>
          <form @submit.prevent="handleUpdateContact">
            <div class="mb-3">
              <label for="editContactType" class="form-label">Type:</label>
              <input type="text" id="editContactType" class="form-control" v-model="editingContact.type" required>
            </div>
            <div class="mb-3">
              <label for="editContactValue" class="form-label">Value:</label>
              <input type="text" id="editContactValue" class="form-control" v-model="editingContact.value" required>
            </div>
            <div class="mb-3">
              <label for="editContactUrl" class="form-label">URL:</label>
              <input type="text" id="editContactUrl" class="form-control" v-model="editingContact.url">
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