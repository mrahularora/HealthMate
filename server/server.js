// server.js
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes"); 
const patientRoutes = require("./routes/patientRoutes"); 
const appointmentRoutes = require('./routes/appointmentRoutes'); 
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use('/api/appointments', appointmentRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
