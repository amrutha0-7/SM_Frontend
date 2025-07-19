const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/location');

app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);

// TODO: Add API routes here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 