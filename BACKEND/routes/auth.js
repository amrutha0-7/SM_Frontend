const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, organization } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role, organization });
    await user.save();
    // Generate JWT token
    const token = jwt.sign(
      { username, email, role, organization },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '7d' }
    );
    res.status(201).json({ username, email, role, organization, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.email, role: user.role, organization: user.organization },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '7d' }
    );
    res.json({ username: user.username, email: user.email, role: user.role, organization: user.organization, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user by username
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ username: user.username, email: user.email, role: user.role, organization: user.organization });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 