const User = require('../models/User');

// Get User Profile Controller
const getuserprofile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password'); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User profile retrieved successfully', user });
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Update User Profile Controller
const updateuserprofile = async (req, res) => {
    const { firstName, lastName, gender } = req.body;
  
    // Validation for first name (only letters and spaces allowed)
    const nameRegex = /^[A-Za-z\s\.\-']+$/; 
    if (firstName && !nameRegex.test(firstName)) {
      return res.status(400).json({ message: 'First name may only contain letters and spaces.' });
    }
  
    // Validation for last name (only letters and spaces allowed)
    if (lastName && !nameRegex.test(lastName)) {
      return res.status(400).json({ message: 'Last name may only contain letters and spaces.' });
    }
  
    // Validation for gender (ensure it's one of the valid options)
    const validGenders = ['Male', 'Female', 'Other'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender. Please select Male, Female, or Other.' });
    }
  
    try {
      const userId = req.user.id;  // Get user ID from the decoded JWT (added by the protect middleware)
  
      // Find the user by their ID and update the profile fields
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, gender },
        { new: true, runValidators: true }  // Return updated document & validate fields
      ).select('-password');  // Exclude password from the response
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send the updated user object back in the response
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  };

  module.exports = { getuserprofile, updateuserprofile };