const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const router = express.Router();

// Route to create appointment slots
router.post('/create', appointmentController.createAppointmentSlots);

// Route to get available slots for a doctor on a specific date
router.post('/available', appointmentController.getAvailableSlots);

module.exports = router;
