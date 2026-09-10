const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles, requireVerifiedAccount } = require('../middleware/rbac');
const upload = require('../middleware/upload');


// Public Routes
router.get('/', mealPlanController.getAllMealPlans);
router.get('/:id', mealPlanController.getMealPlanById);

// Meal Provider Protected Routes
router.get('/provider/my-plans', authenticateJWT, authorizeRoles('meal_provider'), mealPlanController.getMyMealPlans);
router.post('/', authenticateJWT, authorizeRoles('meal_provider'), requireVerifiedAccount, upload.single('image'), mealPlanController.createMealPlan);
router.delete('/:id', authenticateJWT, authorizeRoles('meal_provider'), requireVerifiedAccount, mealPlanController.deleteMealPlan);
router.delete('/food-item/:foodId', authenticateJWT, authorizeRoles('meal_provider'), mealPlanController.deleteFoodItem);
router.post(
  '/food-item', 
  authenticateJWT, 
  authorizeRoles('meal_provider'), 
  upload.single('image'), 
  mealPlanController.addFoodItem
);

// Student review route
router.post(
  '/:id/reviews', 
  authenticateJWT, 
  authorizeRoles('student'), 
  mealPlanController.addMealReview
);


module.exports = router;