const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Save or update location
router.post('/', async (req, res) => {
  try {
    const { username, display_name, lat, lon, address } = req.body;
    if (!username || !display_name || !lat || !lon) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const location = await Location.findOneAndUpdate(
      { username },
      { display_name, lat, lon, address, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get location by username
router.get('/:username', async (req, res) => {
  try {
    const location = await Location.findOne({ username: req.params.username });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 