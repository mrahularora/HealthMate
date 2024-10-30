// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  doctorId: { type: Number, unique: true } // Field for auto-incrementing ID
});

// Pre-save hook to auto-increment doctorId
doctorSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Find the counter document or create one if it doesn’t exist
      const counter = await Counter.findOneAndUpdate(
        { id: 'doctorId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.doctorId = counter.seq; // Assign the incremented sequence to doctorId
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
