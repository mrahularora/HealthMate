import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/doctorslist.css';

const UserDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]); // For filtered doctors based on search
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    // Function to fetch the doctors list
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/doctors');
        console.log("Fetched doctors:", response.data);
        setDoctors(response.data);
        setFilteredDoctors(response.data); // Set all doctors initially
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Handle search query change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter doctors based on the search query (by name, specialty, etc.)
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  return (
    <div className="user-doctors-list">
      <h2 className="text-center mb-4">Available Doctors</h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search doctors by name or specialty..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="doctor-list-container">
          {filteredDoctors.length === 0 ? (
            <p>No doctors found for the given search criteria.</p>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="doctor-row">
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
