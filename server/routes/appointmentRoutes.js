const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Route to create appointment slots
router.post("/create", appointmentController.createAppointmentSlots);

// Route to get available slots for a doctor on a specific date
router.post("/available", appointmentController.getAvailableSlots);

// // Route to get appointments for the logged-in user
// router.get('/', protect, appointmentController.viewAppointments);

module.exports = router;
