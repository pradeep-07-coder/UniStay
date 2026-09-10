const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

<<<<<<< HEAD
// Developer 3 Route Imports
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const mealConsumptionRoutes = require('./routes/mealConsumptionRoutes');
=======
// Developer 1 Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// API Routes (Developer 3 Domain: Catering, Meal Plans & Scanner)
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/meal-consumption', mealConsumptionRoutes);
=======
// API Routes (Developer 1 Domain: IAM & Admin Console)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
>>>>>>> f918e59174354a541a888ca56b5437c45559316d

// Base Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
<<<<<<< HEAD
      module: 'Developer 3 - Meal Plans & Scanner Engine',
=======
      module: 'Developer 1 - Auth & Core Administration',
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
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
<<<<<<< HEAD
  console.log(`ðŸš€ [Dev 3: Meal Plans & Scanner] Server running on port ${PORT}`);
=======
  console.log(`ðŸš€ [Dev 1: Auth & Admin] Server running on port ${PORT}`);
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
});