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