const Appointment = require("../models/Appointments");
const Doctor = require("../models/Doctor");
const User = require('../models/User');

// API to create timeslots for doctors
exports.createAppointmentSlots = async (req, res) => {
  const { doctorId, appointments } = req.body;

  // Validate that appointments is an array
  if (!Array.isArray(appointments)) {
    return res.status(400).json({ message: "Appointments must be an array." });
  }

  try {
    let allDuplicateSlots = []; // To track duplicate slots

    // Loop through each appointment and check for duplicates
    for (let appointment of appointments) {
      const { date, timeSlots } = appointment;

      if (!date || !timeSlots || timeSlots.length === 0) {
        return res.status(400).json({
          message: "Each appointment must have a valid date and time slots.",
        });
      }

      const existingAppointment = await Appointment.findOne({ doctorId, date });

      if (existingAppointment) {
        const existingTimeSlots = existingAppointment.timeSlots;

        // Check each new slot against existing slots
        const duplicateSlots = timeSlots.filter((newSlot) =>
          existingTimeSlots.some(
            (existingSlot) =>
              existingSlot.startTime === newSlot.startTime &&
              existingSlot.endTime === newSlot.endTime
          )
        );

        if (duplicateSlots.length > 0) {
          allDuplicateSlots.push(...duplicateSlots);
        }
      }
    }

    // Return error if duplicates exist
    if (allDuplicateSlots.length > 0) {
      return res.status(400).json({
        message: "Duplicate slots found.",
        duplicateSlots: allDuplicateSlots,
      });
    }

    // Add or update slots
    for (let appointment of appointments) {
      const { date, timeSlots } = appointment;

      let existingAppointment = await Appointment.findOne({ doctorId, date });

      if (existingAppointment) {
        // Add new slots to existing appointment
        existingAppointment.timeSlots.push(...timeSlots);
        await existingAppointment.save();
      } else {
        // Create a new appointment
        await Appointment.create({ doctorId, date, timeSlots });
      }
    }

    res
      .status(200)
      .json({ message: "Appointment slots created successfully!" });
  } catch (err) {
    console.error("Error creating appointment slots:", err);
    res.status(500).json({
      message: "Error creating appointment slots.",
      error: err.message,
    });
  }
};

// API to fetch available slots for a doctor and date
exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.body;

  if (!doctorId || !date) {
    return res
      .status(400)
      .json({ message: "Doctor ID and date are required." });
  }

  try {
    const appointment = await Appointment.findOne({ doctorId, date });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "No appointments found for the selected date." });
    }

    const availableSlots = appointment.timeSlots.filter(
      (slot) => slot.status === "Available"
    );

    if (availableSlots.length === 0) {
      return res
        .status(404)
        .json({ message: "No available slots for the selected date." });
    }

    res.status(200).json({ availableSlots });
  } catch (err) {
    console.error("Error fetching available slots:", err);
    res
      .status(500)
      .json({ message: "Error fetching available slots.", error: err.message });
  }
};

// API to fetch all time slots for a doctor
exports.getAllTimeSlots = async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorId });

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for the doctor." });
    }

    const allTimeSlots = appointments.flatMap((appointment) => {
      return appointment.timeSlots.map((slot) => ({
        date: appointment.date,
        ...slot._doc,
      }));
    });

    res.status(200).json({ timeSlots: allTimeSlots });
  } catch (err) {
    console.error("Error fetching time slots:", err);
    res.status(500).json({ message: "Error fetching time slots.", error: err.message });
  }
};

// API to delete an available slot
exports.deleteAvailableSlot = async (req, res) => {
  const { doctorId, date, startTime, endTime } = req.body;

  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({
      message: "Doctor ID, date, startTime, and endTime are required.",
    });
  }

  try {
    const appointment = await Appointment.findOne({ doctorId, date });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found for the given date." });
    }

    const slotIndex = appointment.timeSlots.findIndex(
      (slot) =>
        slot.startTime === startTime &&
        slot.endTime === endTime &&
        slot.status === "Available"
    );

    if (slotIndex === -1) {
      return res.status(400).json({ message: "Slot is not available or does not exist." });
    }

    // Remove the slot
    appointment.timeSlots.splice(slotIndex, 1);
    await appointment.save();

    res.status(200).json({ message: "Slot deleted successfully." });
  } catch (err) {
    console.error("Error deleting time slot:", err);
    res.status(500).json({ message: "Error deleting time slot.", error: err.message });
  }
};


// API to handle booking requests
exports.bookAppointmentRequest = async (req, res) => {
  const { doctorId, date, startTime, endTime, userDetails } = req.body;

  if (!doctorId || !date || !startTime || !endTime || !userDetails) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const appointment = await Appointment.findOne({ doctorId, date });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "No appointments found for the selected date." });
    }

    const timeSlot = appointment.timeSlots.find(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!timeSlot || timeSlot.status !== "Available") {
      return res
        .status(400)
        .json({ message: "Time slot is not available for booking." });
    }

    // Update the slot's details
    timeSlot.status = "Requested";
    timeSlot.isBooked = true;
    timeSlot.bookedBy = userDetails.userId;
    timeSlot.userDetails = userDetails;

    await appointment.save();

    res.status(200).json({ message: "Appointment request sent successfully." });
  } catch (err) {
    console.error("Error booking appointment request:", err);
    res.status(500).json({
      message: "Error booking appointment request.",
      error: err.message,
    });
  }
};

// API to fetch all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorId }).populate(
      "timeSlots.bookedBy"
    );

    if (appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for the doctor." });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({
      message: "Error fetching doctor appointments.",
      error: err.message,
    });
  }
};

exports.getAppointmentRequests = async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorId }).lean();

    // Extract only requested slots
    const requestedSlots = appointments.flatMap((appointment) =>
      appointment.timeSlots
        .filter((slot) => slot.status === "Requested")
        .map((slot) => ({
          ...slot,
          date: appointment.date,
          appointmentId: appointment._id,
        }))
    );

    res.status(200).json(requestedSlots);
  } catch (err) {
    console.error("Error fetching appointment requests:", err);
    res.status(500).json({
      message: "Error fetching appointment requests.",
      error: err.message,
    });
  }
};

// API to update the status of an appointment slot
exports.updateAppointmentStatus = async (req, res) => {
  const { doctorId, appointmentId, slotId, status } = req.body;

  // Validate required fields
  if (!doctorId || !appointmentId || !slotId || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Find the timeslot by slotId
    const timeSlot = appointment.timeSlots.id(slotId);

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found." });
    }

    // Update the timeslot status
    if (status === "Confirmed") {
      timeSlot.status = "Confirmed";
      timeSlot.isBooked = true;
    } else if (status === "Rejected") {
      timeSlot.status = "Available";
      timeSlot.isBooked = false;
      timeSlot.userDetails = null; // Clear user details
    }

    // Save the updated appointment
    await appointment.save();

    res
      .status(200)
      .json({ message: `Appointment status updated to ${status}.` });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).json({
      message: "Error updating appointment status.",
      error: err.message,
    });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorId }).lean();

    // Filter only confirmed appointments
    const confirmedAppointments = appointments.flatMap((appointment) =>
      appointment.timeSlots
        .filter((slot) => slot.status === "Confirmed")
        .map((slot) => ({
          ...slot,
          date: appointment.date,
          appointmentId: appointment._id,
        }))
    );

    res.status(200).json(confirmedAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({
      message: "Error fetching appointments.",
      error: err.message,
    });
  }
};

// Get all the accepted appointments for the logged-in Doctor
exports.getAcceptedAppointments = async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ message: "Doctor ID is required." });
  }

  try {
    const appointments = await Appointment.find({ doctorId })
      .populate("timeSlots.bookedBy", "firstName lastName email phone")
      .lean();

    // Filter slots with specific statuses
    const acceptedAppointments = appointments.flatMap((appointment) =>
      appointment.timeSlots
        .filter((slot) =>
          ["Confirmed", "Completed", "InProgress"].includes(slot.status)
        )
        .map((slot) => ({
          ...slot,
          date: appointment.date,
          appointmentId: appointment._id,
        }))
    );

    res.status(200).json(acceptedAppointments);
  } catch (err) {
    console.error("Error fetching accepted appointments:", err);
    res.status(500).json({
      message: "Error fetching accepted appointments.",
      error: err.message,
    });
  }
};

// Get Appointment Details

exports.getAppointmentDetails = async (req, res) => {
  const { appointmentId, slotId } = req.query;

  if (!appointmentId || !slotId) {
    return res
      .status(400)
      .json({ message: "Appointment ID and Slot ID are required." });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const timeSlot = appointment.timeSlots.id(slotId);

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found." });
    }

    res.status(200).json({
      userDetails: timeSlot.userDetails,
      prescription: timeSlot.prescription,
      status: timeSlot.status,
    });
  } catch (err) {
    console.error("Error fetching appointment details:", err);
    res.status(500).json({
      message: "Error fetching appointment details.",
      error: err.message,
    });
  }
};

// Update Prescrition by Doctor
exports.updateAppointmentDetails = async (req, res) => {
  const { appointmentId, slotId, status, prescription } = req.body;

  if (!appointmentId || !slotId) {
    return res
      .status(400)
      .json({ message: "Appointment ID and Slot ID are required." });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const timeSlot = appointment.timeSlots.id(slotId);

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found." });
    }

    // Update the status if provided
    if (status) {
      timeSlot.status = status;
      if (status === "Completed") {
        timeSlot.isBooked = true; // Ensure it remains booked
      }
    }

    // Update the prescription if provided
    if (prescription) {
      timeSlot.prescription = prescription;
    }

    await appointment.save();

    res.status(200).json({ message: "Appointment updated successfully." });
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({
      message: "Error updating appointment.",
      error: err.message,
    });
  }
};

// Controller to cancel appointment
exports.cancelAppointment = async (req, res) => {
  const { appointmentId, slotId } = req.body;
  console.log(req.body)

  if (!appointmentId || !slotId) {
      return res.status(400).json({ message: 'Appointment ID and Slot ID are required.' });
  }

  try {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found.' });
      }

      const slot = appointment.timeSlots.id(slotId);

      if (!slot || !slot.isBooked) {
          return res.status(400).json({ message: 'Slot is not booked or does not exist.' });
      }

      slot.isBooked = false;
      slot.status = 'Cancelled';

      await appointment.save();

      res.status(200).json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
      console.error('Cancellation error:', err);
      res.status(500).json({ message: 'Error canceling appointment', error: err.message || err });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const userEmail = req.user?.email; // Ensure `req.user` exists and has `email`

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required." });
    }

    // Fetch appointments with time slots containing the user's email
    const appointments = await Appointment.find({
      "timeSlots.userDetails.email": userEmail,
    }).sort({ date: 1 }); // Sort by date (ascending)

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    // Process appointments to filter time slots specific to the user
    const appointmentsWithUserSlots = appointments.map((appointment) => {
      const userTimeSlots = appointment.timeSlots.filter(
        (slot) => slot.userDetails?.email === userEmail // Safely check userDetails and email
      );
      return {
        ...appointment.toObject(),
        timeSlots: userTimeSlots, // Include only the relevant time slots
      };
    });

    // Extract unique doctor IDs from filtered appointments
    const doctorIds = [
      ...new Set(
        appointmentsWithUserSlots.map((appointment) => appointment.doctorId.toString())
      ),
    ];

    // Fetch doctor details for the associated doctor IDs
    const doctors = await Doctor.find({ doctorId: { $in: doctorIds } });

    // Attach doctor details to the filtered appointments
    const appointmentsWithDoctorDetails = appointmentsWithUserSlots.map((appointment) => {
      const doctor = doctors.find(
        (doc) => doc.doctorId.toString() === appointment.doctorId.toString()
      );
      return {
        ...appointment,
        doctorDetails: doctor || null, // Attach doctor details or null if not found
      };
    });

    res.status(200).json({
      message: "Appointments retrieved successfully.",
      appointments: appointmentsWithDoctorDetails,
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);

    // Handle specific error cases (e.g., database errors)
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid data format.",
        error: err.message,
      });
    } else if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format.",
        error: err.message,
      });
    }

    // Generic error response
    res.status(500).json({
      message: "An error occurred while fetching appointments.",
      error: err.message || err,
    });
  }
};