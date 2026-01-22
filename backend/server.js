const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data

// Import routes
const memesRouter = require('./routes/memes');
const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');

// Use routes
app.use('/api/memes', memesRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FindMeme API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

