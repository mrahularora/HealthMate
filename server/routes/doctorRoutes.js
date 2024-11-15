const express = require('express');
const router = express.Router();
const { getDoctors, searchDoctors } = require('../controllers/doctorController');

// Route to get all doctors
router.get('/', getDoctors);

// Search for doctors by name or specialty
router.get('/search', searchDoctors);

module.exports = router;
