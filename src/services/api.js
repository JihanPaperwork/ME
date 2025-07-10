// src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';
import { getAuthToken, clearAuth } from '../utils/auth.js';

const fetchWrapper = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers, // Merge additional headers
    };

    const token = getAuthToken();
    if (token) {
      headers['x-auth-token'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options, // Merge other options (method, body etc.)
      headers: headers,
    });

    if (response.status === 401 || response.status === 403) {
      clearAuth();
      // Optionally redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error(`Authentication failed or token expired. Redirecting to login.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} from ${endpoint}: ${errorData.msg || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    return null;
  }
};

// Existing fetch functions
export const fetchDashboardData = () => fetchWrapper('dashboard');
export const fetchAboutMeData = () => fetchWrapper('about');
export const fetchEducationData = () => fetchWrapper('education');
export const fetchSkillsData = () => fetchWrapper('skills'); // Will fetch categorized skills for public display
export const fetchExperienceData = () => fetchWrapper('experience');
export const fetchProjectsData = () => fetchWrapper('projects');
export const fetchContactData = () => fetchWrapper('contact');

// New login function
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed:', errorData.msg);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
};

// --- NEW CRUD Functions ---

// Generic CRUD Operations Helper
const createItem = (endpoint, item) => fetchWrapper(endpoint, { method: 'POST', body: JSON.stringify(item) });
const updateItem = (endpoint, id, item) => fetchWrapper(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(item) });
const deleteItem = (endpoint, id) => fetchWrapper(`${endpoint}/${id}`, { method: 'DELETE' });

// About Me CRUD
export const createAboutMe = (item) => createItem('about', item);
export const updateAboutMe = (id, item) => updateItem('about', id, item);

// Education CRUD
export const createEducation = (item) => createItem('education', item);
export const updateEducation = (id, item) => updateItem('education', id, item);
export const deleteEducation = (id) => deleteItem('education', id);

// Skill Categories CRUD
export const fetchSkillCategories = () => fetchWrapper('skill-categories'); // New endpoint to get all categories
export const createSkillCategory = (item) => createItem('skill-categories', item);
export const updateSkillCategory = (id, item) => updateItem('skill-categories', id, item);
export const deleteSkillCategory = (id) => deleteItem('skill-categories', id);

// Individual Skills CRUD
export const fetchIndividualSkills = () => fetchWrapper('individual-skills'); // New endpoint to get all skills with category name
export const createIndividualSkill = (item) => createItem('individual-skills', item);
export const updateIndividualSkill = (id, item) => updateItem('individual-skills', id, item);
export const deleteIndividualSkill = (id) => deleteItem('individual-skills', id);

// Experience CRUD
export const createExperience = (item) => createItem('experience', item);
export const updateExperience = (id, item) => updateItem('experience', id, item);
export const deleteExperience = (id) => deleteItem('experience', id);

// Projects CRUD
export const createProject = (item) => createItem('projects', item);
export const updateProject = (id, item) => updateItem('projects', id, item);
export const deleteProject = (id) => deleteItem('projects', id);

// Contact Info CRUD
export const createContact = (item) => createItem('contact', item);
export const updateContact = (id, item) => updateItem('contact', id, item);
export const deleteContact = (id) => deleteItem('contact', id);