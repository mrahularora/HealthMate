const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String } // Path or URL for the doctor's image
});

module.exports = mongoose.model('Doctor', doctorSchema);
