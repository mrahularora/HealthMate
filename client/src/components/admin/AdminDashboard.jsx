import React, { useState } from 'react';


const AdminDashboard = () => {

const [searchQuery, setSearchQuery] = useState('');
  const patientRecords = [
    { id: 1, name: 'Rahul Arora', age: 25, lastVisit: '2024-10-20' },
    { id: 2, name: 'Tarun Arora', age: 32, lastVisit: '2024-09-15' },
    { id: 3, name: 'Sainath', age: 27, lastVisit: '2024-08-10' },
    { id: 4, name: 'Snehith', age: 55, lastVisit: '2024-07-22' },
    { id: 5, name: 'Rahul', age: 40,  lastVisit: '2024-06-30' },

  ];

  const filteredRecords = patientRecords.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
        <div className="admin-appointments-container">
        <div className="header-container">
          <h2 className="greeting">Welcome, Admin!</h2>
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
        <h5 className="records-title">All Doctors Records</h5>
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
    );
  };
  
  export default AdminDashboard;
  