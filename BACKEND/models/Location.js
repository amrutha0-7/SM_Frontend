const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  display_name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  address: { type: Object }, // Store address details from Nominatim
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema); 