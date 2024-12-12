const User = require('../models/User');

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
