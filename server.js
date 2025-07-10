// server.js
import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs'; // Import bcryptjs
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import authMiddleware from './middleware/authMiddleware.js'; // Import auth middleware

// Load environment variables
dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 3000;

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// Database connection pool for Neon PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Required for Neon (Vercel Postgre) connections
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
    // Check if user exists (UPDATED LINE HERE)
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    const user = userResult.rows[0];

    console.log('  User fetched from DB:', user ? user.username : 'Not found'); // Pastikan baris ini ada
    console.log('  Stored Password Hash:', user ? user.password_hash : 'N/A'); // Tambahkan ini juga untuk debugging tambahan

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials - User not found' }); // Ubah pesan sedikit untuk kejelasan
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('  Password comparison result (isMatch):', isMatch); // Pastikan baris ini ada

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials - Password mismatch' }); // Ubah pesan sedikit untuk kejelasan
    }

    // Return JSON Webtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role // You might want to include role in token
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
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
// Semua rute di bawah ini akan dilindungi menggunakan authMiddleware

// API for Dashboard Info - PROTECTED!
app.get('/api/dashboard', authMiddleware, async (req, res) => { // <-- Add authMiddleware here
  try {
    const result = await pool.query('SELECT * FROM dashboard_info');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// API for About Me (optional: can be public or protected)
app.get('/api/about', async (req, res) => { // Keeping public for portfolio display
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

// API for Education (optional: can be public or protected)
app.get('/api/education', async (req, res) => { // Keeping public for portfolio display
  try {
    const result = await pool.query('SELECT * FROM education ORDER BY years DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching education data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// API for Skills (optional: can be public or protected)
app.get('/api/skills', async (req, res) => { // Keeping public for portfolio display
  try {
    const result = await pool.query(`
      SELECT sc.name AS category_name, s.name AS skill_name
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY sc.id, s.id
    `);

    const skillsByCategory = result.rows.reduce((acc, row) => {
      if (!acc[row.category_name]) {
        acc[row.category_name] = [];
      }
      acc[row.category_name].push(row.skill_name);
      return acc;
    }, {});

    res.json(skillsByCategory);
  } catch (err) {
    console.error('Error fetching skills data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// API for Experiences (optional: can be public or protected)
app.get('/api/experience', async (req, res) => { // Keeping public for portfolio display
  try {
    const result = await pool.query('SELECT * FROM experiences ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching experience data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// API for Projects (optional: can be public or protected)
app.get('/api/projects', async (req, res) => { // Keeping public for portfolio display
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects data:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// API for Contact Info (optional: can be public or protected)
app.get('/api/contact', async (req, res) => { // Keeping public for portfolio display
  try {
    const result = await pool.query('SELECT * FROM contact_info ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contact info:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
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