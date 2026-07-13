const express = require("express");
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create", appointmentController.createAppointmentSlots);
router.post("/available", appointmentController.getAvailableSlots);
router.post("/book-request", protect, appointmentController.bookAppointmentRequest);
router.get("/requests", appointmentController.getAppointmentRequests);
router.patch("/status", appointmentController.updateAppointmentStatus);
router.get("/accepted", appointmentController.getAcceptedAppointments);
router.get("/details", appointmentController.getAppointmentDetails);
router.patch("/details", appointmentController.updateAppointmentDetails);
router.get("/slots/:doctorId", appointmentController.getAllTimeSlots);
router.delete("/slot", appointmentController.deleteAvailableSlot);
router.get("/", protect, appointmentController.getAppointments);
router.patch("/cancel", protect, appointmentController.cancelAppointment);

module.exports = router;
