const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth'); // Import the auth middleware

// Route to get user profile
router.get('/profile', auth, profileController.getProfile);

// Route to update user profile
router.put('/profile', auth, profileController.updateProfile);

// Route to log out user (clear the token from cookies)
router.get('/logout', profileController.logout);

module.exports = router;
