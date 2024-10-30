// /routes/authRoutes.js
const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Adjusted import

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/logout', protect, logout); // Use the protect middleware

// New protected route to protectget user profile
router.get('/profile', (req, res) => {
  res.status(200).json({
    message: 'User profile retrieved successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      gender: req.user.gender,
      role: req.user.role,
    },
  });
});

module.exports = router;
