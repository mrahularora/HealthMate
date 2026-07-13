const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctorsList,
  searchDoctors,
} = require("../controllers/doctorController");

router.get("/", getDoctors);
router.get("/list", getDoctorsList);
router.get("/search", searchDoctors);

module.exports = router;
