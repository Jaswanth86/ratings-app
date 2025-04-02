// routes/user.js
const express = require('express');
const router =s = express.Router();
const db = require('../config/db');
const { auth, restrictTo } = require('../middleware/auth');
const bcrypt = require('bcrypt');

router.use(auth);
router.use(restrictTo('user'));

router.get('/stores', async (req, res) => {
  try {
    db.all(`
      SELECT s.*, AVG(r.rating) as overall_rating, ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = ?
      GROUP BY s.id
    `, [req.user.id], (err, rows) => {
      if (err) throw new Error('Database query failed');
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/rating', async (req, res) => {
  const { storeId, rating } = req.body;
  if (!storeId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid rating data' });
  }
  try {
    db.run(
      'INSERT OR REPLACE INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [req.user.id, storeId, rating],
      function(err) {
        if (err) throw new Error('Failed to submit rating');
        res.status(201).json({ message: 'Rating submitted successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || 
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(newPassword)) {
    return res.status(400).json({ error: 'Invalid password format' });
  }
  
  try {
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, row) => {
      if (err) throw new Error('Database query failed');
      if (!row) throw new Error('User not found');
      
      const match = await bcrypt.compare(currentPassword, row.password);
      if (!match) return res.status(401).json({ error: 'Current password incorrect' });
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id],
        function(err) {
          if (err) throw new Error('Failed to update password');
          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;