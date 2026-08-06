const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, verifyAdmin } = require('../middleware/auth');

const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * POST /api/auth/login
 * Validates username/password against the admins table.
 * On success, sets an HttpOnly JWT cookie (24h expiry).
 */
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  const db = req.app.get('db');

  db.get(
    'SELECT id, username, password_hash FROM admins WHERE username = ?',
    [username.trim()],
    (err, admin) => {
      if (err) {
        console.error('Auth DB error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
      }

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = bcrypt.compareSync(password, admin.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set HttpOnly cookie
      res.cookie('bc_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      return res.json({
        success: true,
        message: 'Login successful.',
        admin: { id: admin.id, username: admin.username }
      });
    }
  );
});

/**
 * POST /api/auth/logout
 * Clears the JWT cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('bc_admin_token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/check
 * Verifies if the current session is valid.
 * Used by the dashboard on page load.
 */
router.get('/check', verifyAdmin, (req, res) => {
  return res.json({
    success: true,
    admin: { id: req.admin.id, username: req.admin.username }
  });
});

module.exports = router;
