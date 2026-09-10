const express = require('express');
const router = express.Router();
const foodOrderController = require('../controllers/foodOrderController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.post('/place', authenticateJWT, authorizeRoles('student'), foodOrderController.placeOrder);
router.get('/student', authenticateJWT, authorizeRoles('student'), foodOrderController.getStudentOrders);
router.get('/provider', authenticateJWT, authorizeRoles('meal_provider'), foodOrderController.getProviderOrders);
router.patch('/:order_id/status', authenticateJWT, authorizeRoles('meal_provider'), foodOrderController.updateOrderStatus);
router.post('/:order_id/confirm-voucher', authenticateJWT, authorizeRoles('meal_provider'), foodOrderController.confirmOrderCollection);

module.exports = router;