const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getStats, 
  getDetails,
  getAllContacts,
  getAllAppointmentsByDoctor,
  getAppointmentDetails
} = require('../controllers/AdminController');
const router = express.Router();

// Fetch users with optional role and pagination
router.get('/users', getUsers);

// Update user role
router.put('/users/:id', updateUserRole);

// Delete user
router.delete('/users/:id', deleteUser);

// Route for statistics overview
router.get('/stats', getStats);

// Route for fetching details based on type
router.get('/details/:type', getDetails);

router.get('/contacts', getAllContacts);

// Route to fetch all appointments grouped by doctor
router.get("/appointments", getAllAppointmentsByDoctor);

// Route to fetch details of a specific appointment
router.get("/appointments/:id", getAppointmentDetails);

module.exports = router;
