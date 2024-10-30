// /server.js
const express = require('express');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv'); // Load environment variables
const cors = require('cors'); // CORS middleware
const cookieParser = require('cookie-parser'); // Cookie parser middleware

dotenv.config(); // Load environment variables from .env file

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/auth', authRoutes); // Set up authentication routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
