import React from 'react';
import Sidebar from '../components/common/Sidebar';
import '../css/userpage.css';
import '../css/sidebar.css';

const UserPage = () => {
  const appointments = [
    {
      id: 1,
      patientName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
    },
    {
      id: 3,
      patientName: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phone: '555-555-5555',
    },
    {
      id: 1,
      patientName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
    },
    {
      id: 3,
      patientName: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phone: '555-555-5555',
    }
  ];

  return (
    <div className="user-page">
      <Sidebar />
      <div className="appointments-container">
        <h2 className="mb-2">Current Appointments</h2>
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <h5>{appointment.patientName}</h5>
              <p>Email: {appointment.email}</p>
              <p>Phone: {appointment.phone}</p>
              <button className="reschedule-button">Reschedule</button>
              <button className="cancel-button">Cancel</button>
            </div>
          ))}
        </div>
        <h2 className="mb-2">Past Appointments</h2>
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <h5>{appointment.patientName}</h5>
              <p>Email: {appointment.email}</p>
              <p>Phone: {appointment.phone}</p>
              <button className="reschedule-button">Reschedule</button>
              <button className="cancel-button">Cancel</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
