const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');


const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const accommodationRoutes = require('./routes/accommodationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const mealPlanRoutes = require('./routes/mealPlanRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const mealConsumptionRoutes = require('./routes/mealConsumptionRoutes');

const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');
const foodOrderRoutes = require('./routes/foodOrderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/accommodations', accommodationRoutes);
app.use('/api/bookings', bookingRoutes);

app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/meal-consumption', mealConsumptionRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/food-orders', foodOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Base Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'success',
      module: 'UniStay API - All Modules',
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
  console.log(`🚀 [UniStay] Server running on port ${PORT}`);
});