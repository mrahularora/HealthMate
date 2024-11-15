const mongoose = require('mongoose');

// Schema for individual time slots
const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { 
      type: String, 
      required: true // Start time is required and stored as a string
    },
    endTime: { 
      type: String, 
      required: true // End time is required and stored as a string
    },
    isBooked: { 
      type: Boolean, 
      default: false // Indicates whether the slot is booked (default: false)
    },
    bookedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null // Reference to the patient who booked the slot, if any
    },
    status: {
      type: String, // Tracks the status of the appointment
      enum: [
        'Available', 
        'Requested', 
        'Confirmed', 
        'Cancelled', 
        'Completed', 
        'No-Show', 
        'Rescheduled' // Valid statuses for appointment lifecycle
      ],
      default: 'Available' // Default status for new time slots
    },
  },
  { 
    _id: true // Ensures each time slot has a unique ID
  }
);

/**
 * Appointment Lifecycle:
 * - Patient views available slots → Status: 'Available'
 * - Patient requests a booking → Status: 'Requested'
 * - Doctor approves the booking → Status: 'Confirmed'
 * - Patient cancels or fails to show → Status: 'Cancelled' or 'No-Show'
 * - Appointment is completed → Status: 'Completed'
 */

// Schema for the appointment
const appointmentSchema = new mongoose.Schema(
  {
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, // Reference to the doctor
      ref: 'Doctor', 
      required: true // Doctor ID is mandatory
    },
    date: { 
      type: Date, // Date of the appointment
      required: true 
    },
    timeSlots: { 
      type: [timeSlotSchema], // Array of embedded time slots
      validate: {
        validator: function (v) {
          return v.length > 0; // Ensures at least one time slot exists
        },
        message: 'There must be at least one time slot.'
      },
    },
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt fields
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
