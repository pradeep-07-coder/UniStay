const express = require('express');
const router = express.Router();
const mealConsumptionController = require('../controllers/mealConsumptionController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles, requireVerifiedAccount } = require('../middleware/rbac');

// Meal Provider Scans ID Card
router.post('/scan', authenticateJWT, authorizeRoles('meal_provider'), requireVerifiedAccount, mealConsumptionController.scanAndLogMeal);

// View Logs (Provider or Student)
router.get('/logs', authenticateJWT, mealConsumptionController.getConsumptionLogs);

module.exports = router;