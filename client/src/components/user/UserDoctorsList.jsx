import React, { useEffect, useState } from 'react';
import { fetchDoctors, searchDoctorsByQuery } from '../../services/doctorService';
import '../../css/doctorslist.css';

const UserDoctorsList = () => {
  const [doctors, setDoctors] = useState([]); // Cache of all doctors
  const [filteredDoctors, setFilteredDoctors] = useState([]); // Displayed doctors
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch and cache the initial list of doctors
    const loadDoctors = async () => {
      try {
        const data = await fetchDoctors();
        setDoctors(data); // Cache the full doctor list
        setFilteredDoctors(data); // Initially, display all doctors
      } catch (error) {
        setError('Error fetching doctors.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  // Handle search input changes
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length === 0) {
      // Reset to cached doctors if query is cleared
      setFilteredDoctors(doctors);
    } else if (query.length < 3) {
      // Use cached data for short queries
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      // Call API for longer or complex queries
      try {
        const filteredDoctors = await searchDoctorsByQuery(query);
        setFilteredDoctors(filteredDoctors);
      } catch (error) {
        setError('Error searching doctors.');
      }
    }
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
                  <p>
                    <strong>Specialty:</strong> {doctor.specialty}
                  </p>
                  <p>
                    <strong>Experience:</strong> {doctor.experience} years
                  </p>
                  <p>{doctor.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default UserDoctorsList;
