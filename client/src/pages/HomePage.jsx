import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Full URL to backend
        const response = await axios.get('http://localhost:5000/api/doctors');
        console.log("Fetched doctors:", response.data); // Debugging log
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      <div className="hero-section mb-4">
        <div className="hero-content">
          <h1>Welcome to HealthMate</h1>
          <p>Your journey begins here.</p>
          <a href="#get-started" className="btn">Get Started</a>
        </div>
      </div>

      <h1 className="text-center">Doctors</h1>
      <div className="grid-container mb-4">
        {doctors.length === 0 ? (
          <p>Loading doctors...</p>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor._id} className="grid-item">
              <img src={doctor.imageUrl} alt={doctor.name} />
              <div className="doctor-details">
                <h3>{doctor.name}</h3>
                <p><strong>Specialty:</strong> {doctor.specialty}</p>
                <p><strong>Experience:</strong> {doctor.experience} years</p>
                <p>{doctor.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
