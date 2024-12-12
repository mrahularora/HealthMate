import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext); 

  return (
    <div className="sidebar">
      <ul>
        {/* Common links for all users */}

        {/* Role-specific links */}
        {user?.role === 'User' && (
          <>
          <h5 className="mb-4 fw-bold"><img src="/assets/images/icons/patient-portal.png" className="wid35" alt="patientportal" /> Patient Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
          <li><a href="/UserPage">Dashboard</a></li>
            <li><a href="/Profile">See Profile</a></li>
            <li><a href="/UserAppointments">All Appointments</a></li>
            <li><a href="/doctorslist">See a Doctor</a></li>
            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Doctor' && (
          <>
          <h5 className="mb-4 fw-bold"><img src="/assets/images/icons/doctor-portal.png" className="wid35" alt="doctorportal" /> Doctor Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
          <li><a href="/DoctorPage">Dashboard</a></li>
            <li><a href="/Profile">See Profile</a></li>
            <li><a href="/CreateAppointment">Create Appointments</a></li>
            <li><a href="/AcceptedAppointments">View All Appointments</a></li>
            <li><a href="/RequestedAppointments">Requested Appointments</a></li>
            <li><a href="/Patients">Patients List</a></li>
            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
          <h5 className="mb-4 fw-bold"><img src="/assets/images/icons/admin-portal.png" className="wid35" alt="adminportal" /> Admin Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
          <li><a href="/AdminPage">Dashboard</a></li>
            <li><a href="/Profile">See Profile</a></li>
            <li><a href="/admin/ManageUsers">Manage Users</a></li>
            <li><a href="/admin/appointments">View All Appointments</a></li>
            <li><a href="/admin/Contact">Contact Details</a></li>

            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

