// routes/store.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, restrictTo } = require('../middleware/auth');
const bcrypt = require('bcrypt');

router.use(auth);
router.use(restrictTo('store_owner'));

router.get('/dashboard', async (req, res) => {
  try {
    db.all(`
      SELECT u.name, r.rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = ?
    `, [req.user.id], (err, ratings) => {
      if (err) throw new Error('Database query failed');
      db.get(`
        SELECT AVG(r.rating) as average_rating
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        WHERE s.owner_id = ?
      `, [req.user.id], (err, avg) => {
        if (err) throw new Error('Database query failed');
        res.json({ ratings, averageRating: avg.average_rating });
      });
    });
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