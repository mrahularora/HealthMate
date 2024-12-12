import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorList } from "../../services/doctorService";
import "../../css/userdoctorlist.css";
import Sidebar from "../common/Sidebar";

const DoctorListComponent = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getDoctorList();
        setDoctors(response.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors.");
      }
    };

    fetchDoctors();
  }, []);

  const handleBookAppointment = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div class="doctor-list-container">
      <Sidebar /> 
    <div className="page-content">
      <h1 className="doctor-list-title">See a Doctor</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="doctor-list">
        {doctors.map((doctor) => (
          <li key={doctor._id} className="doctor-item">
            <p>
              <strong>Name:</strong> {doctor.firstName} {doctor.lastName}
            </p>
            <p>
              <strong>Email:</strong> {doctor.email}
            </p>
            <p>
              <strong>Gender:</strong> {doctor.gender}
            </p>
            <button
              className="book-appointment-btn"
              onClick={() => handleBookAppointment(doctor._id)}
            >
              Book Appointment
            </button>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
};

export default DoctorListComponent;