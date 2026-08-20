
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../db/connection');
const validate = require('../middleware/validation');
const logger = require('../utils/logger');

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return process.env.JWT_SECRET;
}

async function checkUserExists(req, res, next) {
  const { email } = req.body;

  try {
    const pool = getConnection();
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    next();
  } catch (error) {
    logger.error('Error checking user existence:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

router.post('/register', validate('register'), checkUserExists, async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const pool = getConnection();

    await pool.query(
      'INSERT INTO users (email, password, full_name, created_at) VALUES (?, ?, ?, NOW())',
      [email, hashedPassword, fullName]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', validate('login'), async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = getConnection();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
