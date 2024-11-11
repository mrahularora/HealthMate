const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const router = express.Router();

// Route to create appointment slots
router.post('/create', appointmentController.createAppointmentSlots);


module.exports = router;
