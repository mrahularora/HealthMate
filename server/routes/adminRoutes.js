// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

// Fetch users with role-specific details
router.get('/users', adminController.getUsers);

// Update user role
router.put('/users/:id', adminController.updateUserRole);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
