const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,  
    required: true
  },
  timeSlots: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isBooked: { type: Boolean, default: false },
      bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        default: null
      }
    }
  ]
}, {
  timestamps: true 
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
