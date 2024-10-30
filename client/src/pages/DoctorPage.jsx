import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import '../css/doctorpage.css';
import '../css/sidebar.css';

const DoctorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const patientRecords = [
    { id: 1, name: 'John Doe', age: 45, condition: 'Hypertension', lastVisit: '2024-10-20' },
    { id: 2, name: 'Jane Smith', age: 32, condition: 'Diabetes', lastVisit: '2024-09-15' },
    { id: 3, name: 'Alice Johnson', age: 27, condition: 'Asthma', lastVisit: '2024-08-10' },
    { id: 4, name: 'Bob Brown', age: 55, condition: 'Arthritis', lastVisit: '2024-07-22' },
    { id: 5, name: 'Emma Wilson', age: 40, condition: 'Back Pain', lastVisit: '2024-06-30' },
    { id: 6, name: 'Liam Garcia', age: 60, condition: 'Cardiovascular Disease', lastVisit: '2024-05-25' },
    { id: 7, name: 'Olivia Martinez', age: 36, condition: 'Migraine', lastVisit: '2024-04-15' },
    { id: 8, name: 'Noah Anderson', age: 29, condition: 'Anxiety', lastVisit: '2024-03-12' },
    { id: 9, name: 'Ava Thomas', age: 50, condition: 'Obesity', lastVisit: '2024-02-18' },
    { id: 10, name: 'William Jackson', age: 42, condition: 'Chronic Pain', lastVisit: '2024-01-30' },
    { id: 11, name: 'Sophia White', age: 39, condition: 'Hypothyroidism', lastVisit: '2024-01-10' },
    { id: 12, name: 'James Harris', age: 63, condition: 'Glaucoma', lastVisit: '2023-12-12' },
    { id: 13, name: 'Mia Lewis', age: 30, condition: 'Depression', lastVisit: '2023-11-05' },
    { id: 14, name: 'Elijah Clark', age: 28, condition: 'Allergy', lastVisit: '2023-10-22' },
    { id: 15, name: 'Isabella Walker', age: 47, condition: 'Ulcer', lastVisit: '2023-09-18' },
    { id: 16, name: 'Benjamin Hall', age: 51, condition: 'High Cholesterol', lastVisit: '2023-08-24' },
    { id: 17, name: 'Charlotte King', age: 35, condition: 'Anemia', lastVisit: '2023-07-15' },
    { id: 18, name: 'Henry Scott', age: 65, condition: 'COPD', lastVisit: '2023-06-18' },
    { id: 19, name: 'Amelia Green', age: 41, condition: 'Irritable Bowel Syndrome', lastVisit: '2023-05-28' },
    { id: 20, name: 'Michael Adams', age: 54, condition: 'Stroke Recovery', lastVisit: '2023-04-05' },
  ];

  const filteredRecords = patientRecords.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="doctor-page">
      <Sidebar />
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
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div key={record.id} className="patient-card">
                <h6 className="patient-id">ID: {record.id}</h6>
                <p className="patient-name"><strong>Name:</strong> {record.name}</p>
                <p className="patient-age"><strong>Age:</strong> {record.age}</p>
                <p className="patient-condition"><strong>Condition:</strong> {record.condition}</p>
                <p className="patient-last-visit"><strong>Last Visit:</strong> {record.lastVisit}</p>
              </div>
            ))
          ) : (
            <p className="no-results">No records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
