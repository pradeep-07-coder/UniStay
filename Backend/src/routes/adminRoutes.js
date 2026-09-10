const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// All endpoints in this router are restricted to System Administrators
router.use(authenticateJWT, authorizeRoles('admin'));

// Account Verification Routes
router.get('/verifications/pending', adminController.getPendingVerifications);
router.patch('/verify/:user_type/:id', adminController.verifyUserAccount);

// User Management Routes
router.get('/users', adminController.getAllUsers);
router.patch('/users/status/:role/:id', adminController.toggleUserStatus);

router.post('/universities', adminController.addUniversity);
router.get('/universities', adminController.getAllUniversities);

// System Reports & Analytics Routes
router.get('/reports/summary', adminController.getSystemReports);

module.exports = router;