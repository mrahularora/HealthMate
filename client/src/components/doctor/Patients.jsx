import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/doctorpage.css'; // Using same style as DoctorPage

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  useEffect(() => {
    // Function to fetch the patients list
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/patients');
        console.log("Fetched patients:", response.data);
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on the search query
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="doctor-page">
      <div className="doctor-appointments-container">
        <div className="header-container">
          <h2 className="greeting">Patient List</h2>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-bar"
              placeholder="Search patient by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <h5 className="records-title">All Patient Records</h5>
        <div className="patient-records">
          {loading ? (
            <p>Loading patients...</p>
          ) : filteredPatients.length === 0 ? (
            <p className="no-results">No patients found</p>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient._id} className="patient-card">
                <h6 className="patient-id"><strong>ID:</strong> {patient._id}</h6>
                <p className="patient-name"><strong>Name:</strong> {patient.name}</p>
                <p className="patient-age"><strong>Age:</strong> {patient.age}</p>
                <p className="patient-condition"><strong>Condition:</strong> {patient.condition}</p>
                <p className="patient-last-visit"><strong>Last Visit:</strong> {patient.lastVisit}</p>
                <p className="patient-email"><strong>Email:</strong> {patient.email}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;
