const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Student Subscription Routes
router.post('/', authenticateJWT, authorizeRoles('student'), subscriptionController.subscribeToPlan);
router.get('/student', authenticateJWT, authorizeRoles('student'), subscriptionController.getStudentSubscriptions);
router.patch('/:id/cancel', authenticateJWT, authorizeRoles('student'), subscriptionController.cancelSubscription);

// GET Purchased Student Food Vouchers
router.get(
  '/student/vouchers',
  authenticateJWT,
  authorizeRoles('student'),
  subscriptionController.getStudentVouchers
);

// Meal Provider Subscriber View
router.get('/provider', authenticateJWT, authorizeRoles('meal_provider'), subscriptionController.getProviderSubscribers);

module.exports = router;