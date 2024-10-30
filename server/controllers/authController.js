const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || '123rahul';

// Signup Controller
const signup = async (req, res) => {
  const { firstName, lastName, email, password, gender, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store hashed password
      gender,
      role,
    });

    await newUser.save(); // Save new user to database

    // Generate JWT
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send token in a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // CSRF protection
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ message: 'Thankyou For Signing Up ! User Created' });
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
        console.log('User not found');
        return res.status(400).json({ message: 'User does not exist' });
      }
  
      console.log('User fetched from DB:', user); // Log user details from DB
  
      // Compare password using the matchPassword method from the User model
      const validPassword = await user.matchPassword(password);
      console.log('Entered password:', password); // Log entered password
      console.log('Stored hashed password:', user.password); // Log hashed password from DB
      console.log('Password match:', validPassword); // Log if the passwords match
  
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      // Send token in a cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });
  
      res.status(200).json({ message: 'Login successful' });
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

module.exports = { signup, login, logout };
