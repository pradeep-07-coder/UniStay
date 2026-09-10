const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Student Routes
router.post('/', authenticateJWT, authorizeRoles('student'), bookingController.createBooking);
router.get('/student', authenticateJWT, authorizeRoles('student'), bookingController.getStudentBookings);
router.patch('/:booking_id/cancel', authenticateJWT, authorizeRoles('student'), bookingController.cancelBooking);

// Property Owner Routes
router.get('/owner', authenticateJWT, authorizeRoles('property_owner'), bookingController.getOwnerBookings);
router.patch('/:booking_id/status', authenticateJWT, authorizeRoles('property_owner'), bookingController.updateBookingStatus);

module.exports = router;