const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes"); 
const patientRoutes = require("./routes/patientRoutes"); 
const contactRoutes = require('./routes/contactRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); 
const adminRoutes = require("./routes/adminRoutes")
const reportRoutes = require("./routes/reportRoutes")
const dotenv = require("dotenv");
const cors = require("cors"); // Keep this only here
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

const allowedOrigins = ["http://localhost:3000", "https://capable-halva-678bcb.netlify.app"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};


app.use(cors(corsOptions)); // Use CORS with options
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
    endpoints: {
      auth: "/api/auth",
      doctors: "/api/doctors",
      patients: "/api/patients",
      appointments: "/api/appointments",
      contact: "/api/contact",
      admin: "/api/admin",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', reportRoutes);

// Serve the reports directory as static files
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "An internal server error occurred" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
