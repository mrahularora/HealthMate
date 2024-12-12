const express = require('express');
// const Patient = require('../models/Patient'); // Adjust path as needed
const router = express.Router();

// Get all patients route
router.get('/', async (req, res) => {
  try {
    // Retrieve all patients from the database
    const patients = await Patient.find();
    
    // Check if there are no patients
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: 'No patients found' });
    }

    // Return the patients data as JSON
    res.status(200).json(patients);
  } catch (err) {
    console.error('Error fetching patient data:', err);
    res.status(500).json({ message: 'Error fetching patient data' });
  }
});

module.exports = router;
