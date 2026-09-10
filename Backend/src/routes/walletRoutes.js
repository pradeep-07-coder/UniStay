const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/balance', authenticateJWT, authorizeRoles('meal_provider'), walletController.getWalletBalance);
router.post('/withdraw', authenticateJWT, authorizeRoles('meal_provider'), walletController.withdrawBalance);

module.exports = router;