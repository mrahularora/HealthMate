import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext); 

  return (
    <div className="sidebar">
      <h3 className="mb-4">Features</h3>
      <ul>
        {/* Common links for all users */}

        {/* Role-specific links */}
        {user?.role === 'User' && (
          <>
            <li><a href="/Profile">Patient Profile</a></li>
            <li><a href="/UserAppointments">Appointments</a></li>
            <li><a href="/doctorslist">Doctor's List</a></li>
            {/* <li><a href="/booknew{$ID}">Book New Appointment</a></li> - user will come to this page by doctor's list */} 
          </>
        )}

        {user?.role === 'Doctor' && (
          <>
            <li><a href="/Profile">See Profile</a></li>
            <li><a href="/ViewAppointments">View Appointments</a></li>
            <li><a href="/RequestedAppointments">Requested Appointments</a></li>
            <li><a href="/ReportsPrescriptions">Reports & Prescriptions</a></li>
            <li><a href="/Patients">Patients List</a></li>
            
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <li><a href="/Profile">Admin Profile</a></li>
            <li><a href="/admin/ManageUsers">Manage Users</a></li>
            <li><a href="/admin/appointments">View All Appointments</a></li>
            <li><a href="/admin/ReportsAndPrescriptions">Reports & Prescriptions</a></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

