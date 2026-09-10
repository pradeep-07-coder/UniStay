const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { verifyToken } = require('../utils/jwt');

const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Optional auth middleware so guests or logged-in users can both submit
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};

router.post('/', optionalAuth, inquiryController.createInquiry);

// Admin: View and respond to inquiries
router.get('/', authenticateJWT, authorizeRoles('admin'), inquiryController.getAllInquiries);
router.patch('/:id/respond', authenticateJWT, authorizeRoles('admin'), inquiryController.respondToInquiry);

module.exports = router;

