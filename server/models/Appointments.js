const mongoose = require("mongoose");

// Schema for individual time slots
const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userDetails: {
      type: Object,
      default: null,
      properties: {
        firstName: { type: String },
        lastName: { type: String },
        gender: { type: String },
        age: { type: Number },
        phone: { type: String },
        email: { type: String },
        address: { type: String },
        bloodGroup: { type: String },
        illness: { type: String },
        notes: { type: String },
      },
    },
    status: {
      type: String,
      enum: ["Available", "Requested", "Confirmed", "InProgress", "Completed"],
      default: "Available",
    },
    prescription: {
      medicines: [{ name: String, dosage: String, duration: String }], // List of medicines
      notes: { type: String }, // Doctor's general notes
      advice: { type: String }, // Additional advice for the patient
    },
  },
  {
    _id: true,
  }
);

// Schema for the appointment
const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the doctor
      ref: "User", // Points to the User schema (doctors are users)
      required: true, // Doctor ID is mandatory
    },
    date: {
      type: Date, // Date of the appointment
      required: true,
    },
    timeSlots: {
      type: [timeSlotSchema], // Array of embedded time slots
      validate: {
        validator: function (v) {
          return v.length > 0; // Ensures at least one time slot exists
        },
        message: "There must be at least one time slot.",
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
