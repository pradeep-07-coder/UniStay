const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Student Auth
router.post('/register/student', authController.registerStudent);
router.post('/login/student', authController.loginStudent);

// Property Owner Auth
router.post('/register/owner', authController.registerPropertyOwner);
router.post('/login/owner', authController.loginPropertyOwner);

// Meal Provider Auth
router.post('/register/provider', authController.registerMealProvider);
router.post('/login/provider', authController.loginMealProvider);

// Admin Auth
router.post('/login/admin', authController.loginAdmin);
router.post('/register/admin', authController.registerAdmin); // Useful for seeding initial admin

// Current Authenticated User Profile
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;