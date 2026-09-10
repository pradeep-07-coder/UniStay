const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

// Developer 3 Route Imports
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const mealConsumptionRoutes = require('./routes/mealConsumptionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes (Developer 3 Domain: Catering, Meal Plans & Scanner)
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/meal-consumption', mealConsumptionRoutes);

// Base Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      module: 'Developer 3 - Meal Plans & Scanner Engine',
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
  console.log(`ðŸš€ [Dev 3: Meal Plans & Scanner] Server running on port ${PORT}`);
});