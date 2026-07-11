const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Add it to server/.env before using auth routes.');
  }

  return process.env.JWT_SECRET;
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

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
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    // Send token in a cookie
    res.cookie('token', token, {
      ...getCookieOptions(),
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
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    // Send token in a cookie
    res.cookie('token', token, {
      ...getCookieOptions(),
      maxAge: 3600000, // 1 hour
    });

    // Send user role in the response body
    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.firstName + " " + user.lastName, email: user.email, role: user.role }, 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout Controller
const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie('token', getCookieOptions());
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { signup, login, logout};
