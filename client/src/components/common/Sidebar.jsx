import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Ensure this path matches your project structure

const Sidebar = () => {
  const { user } = useContext(AuthContext); // Access user data from context

  return (
    <div className="sidebar">
      <h3 className="mb-4">Features</h3>
      <ul>
        {/* Common links for all users */}
        <li><a href="/appointments">Current Appointments</a></li>

        {/* Role-specific links */}
        {user?.role === 'User' && (
          <>
            <li><a href="/UserProfile">Patient Profile</a></li>
            <li><a href="/doctorslist">Doctor's List</a></li>
            <li><a href="/booknew">Book New Appointment</a></li>
            <li><a href="/editprofiledetails">Edit Profile Details</a></li>
          </>
        )}

        {user?.role === 'Doctor' && (
          <>
            <li><a href="/DoctorProfile">See Profile</a></li>
            <li><a href="/UpcomingAppointments">Upcoming Appointments</a></li>
            <li><a href="/AllReports">All Reports</a></li>
            <li><a href="/Patients">Patient List</a></li>
            
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <li><a href="/admin/AdminProfile">Admin Profile</a></li>
            <li><a href="/admin/ManageUsers">Manage Users</a></li>
            <li><a href="/admin/appointments">View All Appointments</a></li>
            <li><a href="/admin/Reports">Generate Reports</a></li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

