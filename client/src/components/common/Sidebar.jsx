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
          <h5 className="mb-4">Patient Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
            <li><a href="/Profile">Patient Profile</a></li>
            <li><a href="/UserAppointments">Appointments</a></li>
            <li><a href="/doctorslist">Doctor's List</a></li>
            {/* <li><a href="/booknew{$ID}">Book New Appointment</a></li> - user will come to this page by doctor's list */} 
            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Doctor' && (
          <>
          <h5 className="mb-4 fw-bold">Doctor Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
            <li><a href="/Profile">See Profile</a></li>
            <li><a href="/CreateAppointment">Create Appointment</a></li>
            <li><a href="/ViewAppointments">View All Appointments</a></li>
            <li><a href="/RequestedAppointments">Requested Appointments</a></li>
            <li><a href="/ReportsPrescriptions">Reports & Prescriptions</a></li>
            <li><a href="/Patients">Patients List</a></li>
            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
          <h5 className="mb-4">Admin Portal</h5>
          <hr class="my-4 w-100 mx-auto"></hr>
            <li><a href="/Profile">Admin Profile</a></li>
            <li><a href="/admin/ManageUsers">Manage Users</a></li>
            <li><a href="/admin/appointments">View All Appointments</a></li>
            <li><a href="/admin/ReportsAndPrescriptions">Reports & Prescriptions</a></li>
            <hr class="my-4 w-100 mx-auto"></hr>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

