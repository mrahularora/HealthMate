const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middlewares/authMiddleware");
const {
    getAllTimeSlots,
    deleteAvailableSlot,
    getAppointments,
  } = require("../controllers/appointmentController");
const router = express.Router();

// Route to create appointment slots
router.post("/create", appointmentController.createAppointmentSlots);

// Route to get available slots for a doctor on a specific date
router.post("/available", appointmentController.getAvailableSlots);

// Route to book an appointment slot
router.post("/book-request", appointmentController.bookAppointmentRequest);

// Route to get requested Appointments
router.get("/requests", appointmentController.getAppointmentRequests);

// Route to accept or reject appointment by doctor
router.patch("/status", appointmentController.updateAppointmentStatus);

// Route for accepted appointments
router.get("/accepted", appointmentController.getAcceptedAppointments);

// Get appointment detail page
router.get("/details", appointmentController.getAppointmentDetails);

// Update Prescription
router.patch("/details", appointmentController.updateAppointmentDetails);

// Fetch all slots for a doctor
router.get("/slots/:doctorId", getAllTimeSlots);

// Delete an available slot
router.delete("/slot", deleteAvailableSlot);

// // // Route to get appointments for the logged-in user
router.get("/", protect, appointmentController.getAppointments);

// Route to cancel an appointment
router.patch('/cancel', protect, appointmentController.cancelAppointment);

// // Route to get appointments for the logged-in user
// router.get('/', protect, appointmentController.viewAppointments);

module.exports = router;
