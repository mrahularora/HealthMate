const User = require('../models/User');
const Appointment = require('../models/Appointments'); 
const Contact = require('../models/Contact');

// Get all users with optional role filter and pagination
exports.getUsers = async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;  // Get role filter, page, and limit from query
  const query = {};

  if (role) {
    query.role = role;  // Filter by role if provided
  }

  try {
    // Count total number of users that match the filter
    const totalUsers = await User.countDocuments(query);

    // Fetch users with pagination
    const users = await User.find(query)
      .skip((page - 1) * limit)  // Skip records based on the page number
      .limit(Number(limit))  // Limit number of users returned per page
      .select('-password');  // Exclude password from the response

    res.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;  // Role from request body
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller to fetch statistics
exports.getStats = async (req, res) => {
  console.log('Stats route accessed'); // Debug log
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const totalNormalUsers = await User.countDocuments({ role: 'User' });
    const totalAppointments = await Appointment.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalAdmins,
        totalNormalUsers,
        totalAppointments,
      },
    });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
};


// Controller to fetch details based on type
exports.getDetails = async (req, res) => {
  try {
    const { type } = req.params;
    let details;

    switch (type) {
      case 'appointments':
        // Populate doctor details and map the time slot statuses
        details = await Appointment.find()
          .populate('doctorId', 'firstName lastName')
          .lean()
          .exec();

        details = details.map((appointment) => ({
          doctorName: `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
          date: appointment.date,
          status: appointment.timeSlots.length > 0 ? appointment.timeSlots[0].status : 'N/A',
        }));
        break;

      case 'totalUsers':
        details = await User.find();
        break;

      case 'users':
        details = await User.find({ role: 'User' });
        break;

      case 'doctors':
        details = await User.find({ role: 'Doctor' });
        break;

      case 'admins':
        details = await User.find({ role: 'Admin' });
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    res.status(200).json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Fetch all contact form submissions
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions.",
    });
  }
};

// Fetch all appointments grouped by doctor
exports.getAllAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "firstName lastName email specialization") // Include doctor's details
      .populate("timeSlots.bookedBy", "firstName lastName email phone"); // Include patient details

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
    });
  }
};

// Fetch details of a single appointment
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("doctorId", "firstName lastName email specialization")
      .populate("timeSlots.bookedBy", "firstName lastName email phone");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment details.",
    });
  }
};
