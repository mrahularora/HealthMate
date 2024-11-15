const Appointment = require('../models/Appointments');


// API to create timeslots for doctors

exports.createAppointmentSlots = async (req, res) => {
    const { doctorId, appointments } = req.body;

    // Ensure appointments is an array
    if (!Array.isArray(appointments)) {
        return res.status(400).json({ message: "Appointments must be an array" });
    }

    try {
        // Initialize an array to collect all duplicate time slots
        let allDuplicateSlots = [];

        // Loop through each appointment and check for time slot duplicates
        for (let appointment of appointments) {
            const { date, timeSlots } = appointment;

            if (!date || !timeSlots || timeSlots.length === 0) {
                return res.status(400).json({ message: "Each appointment must have a valid date and time slots" });
            }

            // Check if an appointment already exists for the doctor on the given date
            const existingAppointment = await Appointment.findOne({ doctorId, date });

            if (existingAppointment) {
                const existingTimeSlots = existingAppointment.timeSlots;

                // Track duplicate time slots
                const duplicateSlots = [];

                // Check each new time slot against the existing time slots
                for (const newSlot of timeSlots) {
                    const isDuplicate = existingTimeSlots.some(existingSlot => 
                        existingSlot.startTime === newSlot.startTime && 
                        existingSlot.endTime === newSlot.endTime
                    );

                    if (isDuplicate) {
                        // Add duplicate slot along with the date to the list
                        duplicateSlots.push({ date, ...newSlot });
                    }
                }

                // If there are any duplicates, collect them and stop further processing
                if (duplicateSlots.length > 0) {
                    allDuplicateSlots = [...allDuplicateSlots, ...duplicateSlots];
                }
            }
        }

        // If there are any duplicate slots, return an error response immediately
        if (allDuplicateSlots.length > 0) {
            return res.status(400).json({
                message: 'The following time slots already exist for this date:',
                duplicateSlots: allDuplicateSlots
            });
        }

        // If no duplicates were found, proceed to save the new time slots
        for (let appointment of appointments) {
            const { date, timeSlots } = appointment;

            // Check if the appointment already exists for the doctor on the given date
            const existingAppointment = await Appointment.findOne({ doctorId, date });

            if (existingAppointment) {
                // If appointment exists, add the new time slots to the existing ones
                existingAppointment.timeSlots.push(...timeSlots);
                await existingAppointment.save();
            } else {
                // If no appointment exists for the date, create a new appointment entry
                await Appointment.create({
                    doctorId,
                    date,
                    timeSlots
                });
            }
        }

        // Return a success response if everything is saved correctly
        res.status(200).json({ message: 'Appointment slots created successfully!' });
    } catch (err) {
        console.error('Error Details:', err);  // Log the error for debugging
        res.status(500).json({ message: 'Error creating appointment slots', error: err.message || err });
    }
};

// Controller to get available slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
    const { doctorId, date } = req.body;  // Get doctorId and date from the request body

    if (!doctorId || !date) {
        return res.status(400).json({ message: "Doctor ID and date are required." });
    }

    try {
        // Fetch appointment with time slots for the given doctorId and date
        const appointment = await Appointment.findOne({ doctorId, date });

        if (!appointment) {
            return res.status(404).json({ message: "No appointments found for this doctor on the selected date." });
        }

        // Filter out booked slots and return only available ones
        const availableSlots = appointment.timeSlots.filter(slot => !slot.isBooked);

        if (availableSlots.length === 0) {
            return res.status(404).json({ message: "No available slots for this doctor on the selected date." });
        }

        res.status(200).json({ availableSlots });
    } catch (err) {
        console.error("Error Details:", err);
        res.status(500).json({ message: "Error retrieving available slots", error: err.message || err });
    }
};

// In the appointment controller (controller/appointmentController.js)

exports.bookAppointment = async (req, res) => {
    const { slotId, userId } = req.body;
  
    if (!slotId || !userId) {
      return res.status(400).json({ message: 'Slot ID and User ID are required.' });
    }
  
    try {
      // Find the appointment with the given slotId
      const appointment = await Appointment.findOne({ 'timeSlots._id': slotId });
  
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment slot not found.' });
      }
  
      // Find the specific slot within the appointment
      const slot = appointment.timeSlots.find((slot) => slot._id.toString() === slotId);
  
      if (slot.isBooked) {
        return res.status(400).json({ message: 'This slot is already booked.' });
      }
  
      // Mark the slot as booked and associate it with the user
      slot.isBooked = true;
      slot.bookedBy = userId;
      slot.status = 'Requested';  // You can update this as per your requirements
  
      await appointment.save();
  
      res.status(200).json({ message: 'Appointment booked successfully.' });
    } catch (err) {
      console.error('Booking error:', err);
      res.status(500).json({ message: 'Error booking appointment', error: err.message || err });
    }
};

// Method to view appointments for the logged-in user
exports.viewAppointments = async (req, res) => {
    const userId = req.user.id; // User ID from the authentication middleware

    try {
        // Fetch appointments where the logged-in user has booked a time slot
        const appointments = await Appointment.find({
            'timeSlots.bookedBy': userId // Match time slots where bookedBy is the user
        })
        .populate('doctorId', 'name specialty') // Populate doctor's name and specialty
        .sort({ date: 1 }); // Sort appointments by date in ascending order

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found.' });
        }

        // Filter time slots for each appointment to only include those booked by the user
        appointments.forEach(appointment => {
            // Filter out time slots where bookedBy is null or does not match the userId
            appointment.timeSlots = appointment.timeSlots.filter(slot => slot.bookedBy && slot.bookedBy.toString() === userId);
        });

        res.status(200).json({
            message: 'Appointments retrieved successfully.',
            appointments
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching appointments', error: err.message || err });
    }
};
