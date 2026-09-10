const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Unified Login (Role Auto-Detection)
router.post('/login', authController.unifiedLogin);

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
const verifyAdminSetupSecret = (req, res, next) => {
  const setupSecret = process.env.ADMIN_SETUP_SECRET || 'unistay_master_admin_secret_key_2026';
  const providedSecret = req.headers['x-admin-secret'] || req.body.admin_secret;
  if (providedSecret !== setupSecret) {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Valid administrator setup secret is required to register admin accounts.',
    });
  }
  next();
};

router.post('/login/admin', authController.loginAdmin);
router.post('/register/admin', verifyAdminSetupSecret, authController.registerAdmin);

const upload = require('../middleware/upload');

// Current Authenticated User Profile & Settings
router.get('/me', authenticateJWT, authController.getMe);
router.put('/profile', authenticateJWT, authController.updateProfile);
router.post('/profile-picture', authenticateJWT, upload.single('profileImage'), authController.updateProfilePicture);
router.put('/change-password', authenticateJWT, authController.changePassword);

module.exports = router;