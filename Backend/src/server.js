const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

<<<<<<< HEAD
<<<<<<< HEAD
// Developer 3 Route Imports
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const mealConsumptionRoutes = require('./routes/mealConsumptionRoutes');
=======
<<<<<<< HEAD
// Developer 2 Route Imports
const accommodationRoutes = require('./routes/accommodationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
=======
// Developer 4 Route Imports
const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');
const foodOrderRoutes = require('./routes/foodOrderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
>>>>>>> fcbe8fe5505d71b220d036f08c478b350c0f86b1
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
<<<<<<< HEAD
// API Routes (Developer 3 Domain: Catering, Meal Plans & Scanner)
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/meal-consumption', mealConsumptionRoutes);
=======
<<<<<<< HEAD
// API Routes (Developer 2 Domain: Accommodations & Booking Lifecycle)
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/bookings', bookingRoutes);
=======
// API Routes (Developer 4 Domain: Payments, Vouchers, Orders & Helpdesk)
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/food-orders', foodOrderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inquiries', inquiryRoutes);
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
>>>>>>> fcbe8fe5505d71b220d036f08c478b350c0f86b1
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
<<<<<<< HEAD
      module: 'Developer 3 - Meal Plans & Scanner Engine',
=======
<<<<<<< HEAD
      module: 'Developer 2 - Accommodations & Bookings',
=======
      module: 'Developer 4 - Finance, Vouchers, Orders & Helpdesk',
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
>>>>>>> fcbe8fe5505d71b220d036f08c478b350c0f86b1
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
<<<<<<< HEAD
  console.log(`ðŸš€ [Dev 3: Meal Plans & Scanner] Server running on port ${PORT}`);
=======
<<<<<<< HEAD
  console.log(`ðŸš€ [Dev 2: Accommodations] Server running on port ${PORT}`);
=======
  console.log(`ðŸš€ [Dev 4: Finance & Vouchers] Server running on port ${PORT}`);
>>>>>>> 69c5178f071b6781906c8d3cb8f78ae2f9202a0f
>>>>>>> fcbe8fe5505d71b220d036f08c478b350c0f86b1
=======
  console.log(`ðŸš€ [Dev 1: Auth & Admin] Server running on port ${PORT}`);
>>>>>>> f918e59174354a541a888ca56b5437c45559316d
});