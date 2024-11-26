const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctorsList,
  searchDoctors,
} = require("../controllers/doctorController");

// Route to get all doctors from the User schema
router.get("/", getDoctors);

// Route to get all doctors from the Doctor schema
router.get("/list", getDoctorsList);

// Search for doctors by name or specialty
router.get("/search", searchDoctors);

module.exports = router;
