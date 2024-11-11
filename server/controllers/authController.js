const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret for JWT signing
const JWT_SECRET = process.env.JWT_SECRET;

// Signup Controller
const signup = async (req, res) => {
  const { firstName, lastName, email, password, gender, role } = req.body;

  try {
    // Validate input fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password, // Store plaintext password; hashing happens in the model
      gender,
      role,
    });

    await newUser.save(); // Save new user to database

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ message: 'Thank you for signing up! User created.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Compare password using the matchPassword method from the User model
    const validPassword = await user.matchPassword(password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    // Send user role in the response body
    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role }, // Include role
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Logout Controller
const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get User Profile Controller
const getuserprofile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');  // Exclude password from response
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
  const nameRegex = /^[A-Za-z\s\.\-']+$/; // Only letters, spaces, periods, apostrophes, and hyphens
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

module.exports = { signup, login, logout, getuserprofile, updateuserprofile };
