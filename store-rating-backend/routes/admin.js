// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, restrictTo } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Middleware
router.use(auth); // Ensure auth is a function
router.use(restrictTo('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const [users, stores, ratings] = await Promise.all([
      new Promise(resolve => db.get('SELECT COUNT(*) as users FROM users', [], (err, row) => resolve(row))),
      new Promise(resolve => db.get('SELECT COUNT(*) as stores FROM stores', [], (err, row) => resolve(row))),
      new Promise(resolve => db.get('SELECT COUNT(*) as ratings FROM ratings', [], (err, row) => resolve(row)))
    ]);
    res.json({
      totalUsers: users.users,
      totalStores: stores.stores,
      totalRatings: ratings.ratings
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/user', async (req, res) => {
  const { name, email, password, address, role } = req.body;
  if (name.length < 20 || name.length > 60 || address.length > 400 || 
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password) ||
      !['admin', 'user', 'store_owner'].includes(role)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role],
      function(err) {
        if (err) throw new Error('Email already exists');
        res.status(201).json({ id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/store', async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  if (name.length < 20 || name.length > 60 || address.length > 400 || !ownerId) {
    return res.status(400).json({ error: 'Invalid store data' });
  }
  
  try {
    db.run(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId],
      function(err) {
        if (err) throw new Error('Store creation failed');
        res.status(201).json({ id: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.get('/users', (req, res) => {
  const { name, email, address, role } = req.query;
  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  
  if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
  if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
  if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
  if (role) { query += ' AND role = ?'; params.push(role); }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

router.get('/stores', (req, res) => {
  db.all(`
    SELECT s.*, AVG(r.rating) as rating 
    FROM stores s 
    LEFT JOIN ratings r ON s.id = r.store_id 
    GROUP BY s.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

module.exports = router; // Critical export