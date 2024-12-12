import React, { useState, useEffect, useContext } from "react";
import { getAcceptedAppointments } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import "../../css/doctorpage.css";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext); // Get logged-in user details from AuthContext
  const [appointments, setAppointments] = useState({
    accepted: 0,
    inProgress: 0,
    completed: 0,
  }); // State for appointment counts
  const [error, setError] = useState(null); // State for errors

  // Fetch appointment data for the logged-in doctor
  const fetchAppointmentsData = async () => {
    try {
      if (!user || user.role !== "Doctor") {
        setError("You are not authorized to view this page.");
        return;
      }

      const response = await getAcceptedAppointments(user.id); // Fetch accepted appointments
      const accepted = response.length;
      const inProgress = response.filter(
        (appointment) => appointment.status === "InProgress"
      ).length;
      const completed = response.filter(
        (appointment) => appointment.status === "Completed"
      ).length;

      setAppointments({ accepted, inProgress, completed });
    } catch (err) {
      console.error("Error fetching appointment data:", err);
      setError("Failed to fetch appointment data.");
    }
  };

  useEffect(() => {
    fetchAppointmentsData(); // Fetch data on component load
  }, [user]);

  return (
    <div className="doctor-page">
      <div className="doctor-appointments-container">
      <div className="greeting">Welcome, Doctor !</div>
      <p>Naviagte and see the statistics of the patients currently want to seek appointment with you !</p>
        <div className="header-container">
        </div>
        {error && <p className="error">{error}</p>}
        <div className="doctor-stats-cards">
          <div className="doctor-card">
            <h6>Total Accepted Appointments</h6>
            <p className="doctor-count">{appointments.accepted}</p>
          </div>
          <div className="doctor-card">
            <h6>In-Progress Appointments</h6>
            <p className="doctor-count">{appointments.inProgress}</p>
          </div>
          <div className="doctor-card">
            <h6>Completed Appointments</h6>
            <p className="doctor-count">{appointments.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
