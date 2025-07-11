// server.js
import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authMiddleware from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool for Neon PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the PostgreSQL database!');
  client.release();
});

// --- API Routes for Authentication ---

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt received:');
  console.log('  Username:', username);
  console.log('  Password:', password);

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    const user = userResult.rows[0];

    console.log('  User fetched from DB:', user ? user.username : 'Not found');
    console.log('  Stored Password Hash:', user ? user.password_hash : 'N/A');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials - User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('  Password comparison result (isMatch):', isMatch);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials - Password mismatch' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- API Routes for Dynamic Content (Protected) ---

// API for Dashboard Info - PROTECTED! (READ Only for now, as it's aggregated)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_info');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ABOUT ME CRUD
app.get('/api/about', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about_me LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'About Me data not found' });
    }
  } catch (err) {
    console.error('Error fetching about me data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/about', authMiddleware, async (req, res) => {
  const { name, title, description, profile_pic_url } = req.body;
  if (!name || !title) {
    return res.status(400).json({ msg: 'Name and title are required for About Me.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO about_me (name, title, description, profile_pic_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, title, description, profile_pic_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating about me data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/about/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, title, description, profile_pic_url } = req.body;
  if (!name || !title) {
    return res.status(400).json({ msg: 'Name and title are required for About Me.' });
  }
  try {
    const result = await pool.query(
      'UPDATE about_me SET name = $1, title = $2, description = $3, profile_pic_url = $4 WHERE id = $5 RETURNING *',
      [name, title, description, profile_pic_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'About Me entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating about me data:', err.message);
    res.status(500).send('Server Error');
  }
});

// EDUCATION CRUD
app.get('/api/education', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education ORDER BY years DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching education data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/education', authMiddleware, async (req, res) => {
  const { institution, degree, years } = req.body;
  if (!institution || !degree || !years) {
    return res.status(400).json({ msg: 'All fields are required for Education.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO education (institution, degree, years) VALUES ($1, $2, $3) RETURNING *',
      [institution, degree, years]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating education data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/education/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { institution, degree, years } = req.body;
  if (!institution || !degree || !years) {
    return res.status(400).json({ msg: 'All fields are required for Education.' });
  }
  try {
    const result = await pool.query(
      'UPDATE education SET institution = $1, degree = $2, years = $3 WHERE id = $4 RETURNING *',
      [institution, degree, years, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Education entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating education data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/education/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM education WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Education entry not found' });
    }
    res.json({ msg: 'Education entry deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting education data:', err.message);
    res.status(500).send('Server Error');
  }
});

// SKILL CATEGORIES & SKILLS CRUD
// NOTE: Skills have a slightly more complex structure due to categories.
// For simplicity, we'll expose a GET all skills (categorized) and then
// separate endpoints for managing categories and individual skills.
app.get('/api/skills', async (req, res) => { // Reads all skills categorized
  try {
    const result = await pool.query(`
      SELECT sc.id AS category_id, sc.name AS category_name, s.id AS skill_id, s.name AS skill_name
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY sc.id, s.id
    `);

    const skillsByCategory = result.rows.reduce((acc, row) => {
      if (!acc[row.category_name]) {
        acc[row.category_name] = [];
      }
      acc[row.category_name].push({ id: row.skill_id, name: row.skill_name });
      return acc;
    }, {});

    res.json(skillsByCategory);
  } catch (err) {
    console.error('Error fetching skills data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Manage Skill Categories
app.get('/api/skill-categories', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skill_categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching skill categories:', err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/skill-categories', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: 'Category name is required.' });
  try {
    const result = await pool.query(
      'INSERT INTO skill_categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating skill category:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/skill-categories/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ msg: 'Category name is required.' });
  try {
    const result = await pool.query(
      'UPDATE skill_categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Category not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating skill category:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/skill-categories/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM skill_categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Category not found.' });
    res.json({ msg: 'Category deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting skill category:', err.message);
    res.status(500).send('Server Error');
  }
});

// Manage Individual Skills
app.get('/api/individual-skills', authMiddleware, async (req, res) => { // Get all skills with category name
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.category_id, sc.name as category_name
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY s.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching individual skills:', err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/individual-skills', authMiddleware, async (req, res) => {
  const { name, category_id } = req.body;
  if (!name || !category_id) return res.status(400).json({ msg: 'Skill name and category ID are required.' });
  try {
    const result = await pool.query(
      'INSERT INTO skills (name, category_id) VALUES ($1, $2) RETURNING *',
      [name, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating individual skill:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/individual-skills/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, category_id } = req.body;
  if (!name || !category_id) return res.status(400).json({ msg: 'Skill name and category ID are required.' });
  try {
    const result = await pool.query(
      'UPDATE skills SET name = $1, category_id = $2 WHERE id = $3 RETURNING *',
      [name, category_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Skill not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating individual skill:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/individual-skills/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: 'Skill not found.' });
    res.json({ msg: 'Skill deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting individual skill:', err.message);
    res.status(500).send('Server Error');
  }
});


// EXPERIENCES CRUD
app.get('/api/experience', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experiences ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching experience data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/experience', authMiddleware, async (req, res) => {
  const { title, company, duration, description } = req.body;
  if (!title || !company || !duration || !description) {
    return res.status(400).json({ msg: 'All fields are required for Experience.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO experiences (title, company, duration, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, company, duration, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating experience data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/experience/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, company, duration, description } = req.body;
  if (!title || !company || !duration || !description) {
    return res.status(400).json({ msg: 'All fields are required for Experience.' });
  }
  try {
    const result = await pool.query(
      'UPDATE experiences SET title = $1, company = $2, duration = $3, description = $4 WHERE id = $5 RETURNING *',
      [title, company, duration, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Experience entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating experience data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/experience/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM experiences WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Experience entry not found' });
    }
    res.json({ msg: 'Experience entry deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting experience data:', err.message);
    res.status(500).send('Server Error');
  }
});


// PROJECTS CRUD
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  const { title, description, technologies } = req.body;
  if (!title || !description || !technologies) {
    return res.status(400).json({ msg: 'All fields are required for Project.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, technologies) VALUES ($1, $2, $3) RETURNING *',
      [title, description, technologies]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating project data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, technologies } = req.body;
  if (!title || !description || !technologies) {
    return res.status(400).json({ msg: 'All fields are required for Project.' });
  }
  try {
    const result = await pool.query(
      'UPDATE projects SET title = $1, description = $2, technologies = $3 WHERE id = $4 RETURNING *',
      [title, description, technologies, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Project entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.json({ msg: 'Project deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting project data:', err.message);
    res.status(500).send('Server Error');
  }
});


// CONTACT INFO CRUD
app.get('/api/contact', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_info ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contact info:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.post('/api/contact', authMiddleware, async (req, res) => {
  const { type, value, url } = req.body;
  if (!type || !value) {
    return res.status(400).json({ msg: 'Type and value are required for Contact Info.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO contact_info (type, value, url) VALUES ($1, $2, $3) RETURNING *',
      [type, value, url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating contact info:', err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/contact/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { type, value, url } = req.body;
  if (!type || !value) {
    return res.status(400).json({ msg: 'Type and value are required for Contact Info.' });
  }
  try {
    const result = await pool.query(
      'UPDATE contact_info SET type = $1, value = $2, url = $3 WHERE id = $4 RETURNING *',
      [type, value, url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Contact info entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating contact info:', err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/contact/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM contact_info WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Contact info entry not found' });
    }
    res.json({ msg: 'Contact info entry deleted', id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting contact info:', err.message);
    res.status(500).send('Server Error');
  }
});

// Serve static files from the Vue.js dist folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`In development, frontend runs on Vue's dev server (e.g., http://localhost:5173).`);
});