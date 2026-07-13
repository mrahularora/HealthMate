const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const patients = await User.find({ role: 'User' }).select('-password').sort({ firstName: 1 });
    res.status(200).json(patients);
  } catch (err) {
    console.error('Error fetching patient data:', err);
    res.status(500).json({ message: 'Error fetching patient data' });
  }
});

module.exports = router;
