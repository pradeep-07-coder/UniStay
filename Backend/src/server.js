const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

// Developer 1 Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes (Developer 1 Domain: IAM & Admin Console)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Base Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      module: 'Developer 1 - Auth & Core Administration',
      message: 'UniStay API is live!',
      dbTimestamp: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected internal error occurred.',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ðŸš€ [Dev 1: Auth & Admin] Server running on port ${PORT}`);
});