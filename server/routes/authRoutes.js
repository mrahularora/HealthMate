// /routes/authRoutes.js
const express = require('express');
const { signup, login, logout, getuserprofile, updateuserprofile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Adjusted import

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/logout', protect, logout); // Use the protect middleware

// Protected route to get user profile
router.get('/profile', protect, getuserprofile);  // Fetch user profile after authentication

// Protected route to update user profile
router.put('/profile', protect, updateuserprofile);

module.exports = router;
