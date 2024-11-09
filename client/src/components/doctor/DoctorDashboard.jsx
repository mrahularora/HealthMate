import React, { useEffect, useState } from 'react';
import '../../css/doctorpage.css'; 

const DoctorDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [patientRecords, setPatientRecords] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientRecords = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/patients');
                if (!response.ok) {
                    throw new Error('Failed to fetch patient records');
                }
                const data = await response.json();
                setPatientRecords(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchPatientRecords();
    }, []);

    // Filtered records based on search query
    const filteredRecords = patientRecords.filter((record) =>
        record.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="doctor-appointments-container">
            <div className="header-container">
                <h2 className="greeting">Welcome, Doctor!</h2>
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
                    <p>Loading patient records...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <div key={record._id} className="patient-card">
                                <h6 className="patient-id">ID: {record._id}</h6>
                                <p className="patient-name"><strong>Name:</strong> {record.name}</p>
                                <p className="patient-age"><strong>Age:</strong> {record.age}</p>
                                <p className="patient-condition"><strong>Condition:</strong> {record.condition}</p>
                                <p className="patient-last-visit"><strong>Last Visit:</strong> {new Date(record.lastVisit).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No records found</p>
                    )
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
