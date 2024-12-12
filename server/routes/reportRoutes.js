const express = require('express');
const { generateReport } = require('../controllers/reportController');
const router = express.Router();

// Route to generate the appointment report
router.post('/appointments/:appointmentId/slots/:slotId/report', generateReport);

module.exports = router;
