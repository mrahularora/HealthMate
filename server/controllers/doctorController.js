const Doctor = require('../models/Doctor');

// Controller to get all doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();  // Fetch all doctors from the database
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to search doctors by name or specialty
const searchDoctors = async (req, res) => {
  const { query } = req.query;  // Extract search query from the URL parameters
  
  // Validate if the query is provided
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    // Perform a case-insensitive search for both name and specialty using regex
    const doctors = await Doctor.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },   // Search by doctor name
        { specialty: { $regex: query, $options: 'i' } } // Search by specialty
      ]
    });

    // If no doctors match the query, return a 404 response
    if (doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found matching your query" });
    }

    // Return the list of matching doctors
    return res.status(200).json(doctors);
  } catch (error) {
    console.error("Error searching doctors:", error);
    return res.status(500).json({ message: "Server error while searching doctors" });
  }
};

module.exports = { getDoctors, searchDoctors };
