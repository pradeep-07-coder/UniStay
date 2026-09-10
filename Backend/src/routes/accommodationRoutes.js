const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');
const adminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles, requireVerifiedAccount } = require('../middleware/rbac');
const upload = require('../middleware/upload');

// Public Search Routes
router.get('/', accommodationController.getAllAccommodations);
router.get('/:id', accommodationController.getAccommodationById);

router.get('/universities/list', adminController.getAllUniversities);

// Property Owner Protected Routes
router.get('/owner/my-listings', authenticateJWT, authorizeRoles('property_owner'), accommodationController.getMyAccommodations);
router.post('/', authenticateJWT, authorizeRoles('property_owner'), requireVerifiedAccount, upload.array('images', 5), accommodationController.createAccommodation);
router.put('/:id', authenticateJWT, authorizeRoles('property_owner'), requireVerifiedAccount, upload.array('images', 5), accommodationController.updateAccommodation);
router.delete('/:id', authenticateJWT, authorizeRoles('property_owner'), requireVerifiedAccount, accommodationController.deleteAccommodation);
router.post('/:id/reviews', authenticateJWT, authorizeRoles('student'), accommodationController.addReview);

module.exports = router;