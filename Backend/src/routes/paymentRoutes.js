const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/process', authenticateJWT, paymentController.processDemoPayment);

module.exports = router;