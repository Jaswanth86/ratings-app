const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/signup', (req, res) => {
  const { name, email, address, password, role } = req.body;
  console.log('Received signup data:', { name, email, address, password, role });

  // Validation
  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({ error: 'Name must be 20-60 characters' });
  }
  if (!address || address.length > 400) {
    return res.status(400).json({ error: 'Address must be less than 400 characters' });
  }
  if (!password || !/^(?=.*[A-Z])(?=.*[!@#$%^&*@])[A-Za-z\d!@#$%^&*@]{8,16}$/.test(password)) {
    return res.status(400).json({ error: 'Password must be 8-16 characters with at least one uppercase letter and one special character (!@#$%^&*@)' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!role || !['user', 'store_owner'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "user" or "store_owner"' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Hashing error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    db.run(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address, role],
      function (err) {
        if (err) {
          console.error('Database error:', err);
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        console.log('User created with ID:', this.lastID);
        res.status(201).json({ message: 'Signup successful' });
      }
    );
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Received login data:', { email, password });

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  });
});
module.exports = router;