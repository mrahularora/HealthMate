import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch the doctors list
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors');
        console.log("Fetched doctors:", response.data);
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="user-doctors-list">
      <h2 className="text-center mb-4">Available Doctors</h2>
      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="doctor-grid-container">
          {doctors.length === 0 ? (
            <p>No doctors available at the moment.</p>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor._id} className="doctor-grid-item">
                <img
                  src={doctor.imageUrl || 'default-image-url.jpg'}
                  alt={doctor.name}
                  className="doctor-image"
                />
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
      )}
    </div>
  );
};

export default UserDoctorsList;
