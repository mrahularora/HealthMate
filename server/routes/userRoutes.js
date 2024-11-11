const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify the token
// const authenticate = (req, res, next) => {
//   // Extract token from cookies
//   const token = req.cookies.token; // Token is read directly from the HttpOnly cookie

//   console.log('Token received from request:', token); // Debug log to check token extraction

//   if (!token) {
//     return res.status(401).send({ message: 'No token, authorization denied' });
//   }

//   try {
//     // Verify the token using JWT_SECRET
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach decoded payload to request object
//     console.log('Decoded token:', decoded); // Debug log for decoded token
//     next();
//   } catch (err) {
//     console.error('Token verification error:', err);
//     return res.status(401).send({ message: 'Token is not valid' });
//   }
// };

// Route to fetch user data (doctor data in this case)
// router.get('/userRoutes', async (req, res) => {
//   try {
//     // Fetch user data from the database using the user ID from the token
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).send({ message: 'User not found' });
//     }

//     // Check if the user has a doctor role
//     if (user.role === 'Doctor') {
//       return res.json(user);
//     } else {
//       return res.status(403).send({ message: 'You are not a doctor' });
//     }
//   } catch (err) {
//     console.error('Error fetching user data:', err);
//     return res.status(500).send({ message: 'Server error' });
//   }
// });

module.exports = router;
