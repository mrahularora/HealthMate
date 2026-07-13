const express = require('express');
const { generateReport } = require('../controllers/reportController');
const router = express.Router();

router.post('/appointments/:appointmentId/slots/:slotId/report', generateReport);

module.exports = router;
