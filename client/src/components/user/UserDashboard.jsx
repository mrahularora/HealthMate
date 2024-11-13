
import React from 'react';
import '../../css/userpage.css';

const UserDashboard = () => {
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
      id: 4,
      patientName: 'Mark Williams',
      email: 'mark.williams@example.com',
      phone: '111-222-3333',
    },
    {
      id: 5,
      patientName: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '444-666-8888',
    },
    {
      id: 6,
      patientName: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '999-888-7777',
    },
  ];

  return (
      <div className="appointments-container">
        <h2 className="greeting">Welcome, Patient!</h2>
        <h3 className="records-title">Current Appointments</h3>
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
        <h3 className="records-title">Past Appointments</h3>
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment.id + '-past'} className="appointment-card">
              <h5>{appointment.patientName}</h5>
              <p>Email: {appointment.email}</p>
              <p>Phone: {appointment.phone}</p>
              <button className="reschedule-button">Reschedule</button>
              <button className="cancel-button">Cancel</button>
            </div>
          ))}
        </div>
      </div>
  );
};

export default UserDashboard;
