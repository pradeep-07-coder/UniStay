const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
