import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useContext(AuthContext); 

  return (
    <div className="sidebar">
      <ul>
        {/* Common links for all users */}

        {/* Role-specific links */}
        {user?.role === 'User' && (
          <>
            <h5 className="mb-4 fw-bold">
              <img src="/assets/images/icons/patient-portal.png" className="wid35" alt="patientportal" /> Patient Portal
            </h5>
            <hr className="my-4 w-100 mx-auto"></hr>
            <li><Link to="/UserPage">Dashboard</Link></li>
            <li><Link to="/Profile">See Profile</Link></li>
            <li><Link to="/UserAppointments">All Appointments</Link></li>
            <li><Link to="/doctorslist">See a Doctor</Link></li>
            <hr className="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Doctor' && (
          <>
            <h5 className="mb-4 fw-bold">
              <img src="/assets/images/icons/doctor-portal.png" className="wid35" alt="doctorportal" /> Doctor Portal
            </h5>
            <hr className="my-4 w-100 mx-auto"></hr>
            <li><Link to="/DoctorPage">Dashboard</Link></li>
            <li><Link to="/Profile">See Profile</Link></li>
            <li><Link to="/CreateAppointment">Create Appointments</Link></li>
            <li><Link to="/AcceptedAppointments">View All Appointments</Link></li>
            <li><Link to="/RequestedAppointments">Requested Appointments</Link></li>
            <li><Link to="/Patients">Patients List</Link></li>
            <hr className="my-4 w-100 mx-auto"></hr>
          </>
        )}

        {user?.role === 'Admin' && (
          <>
            <h5 className="mb-4 fw-bold">
              <img src="/assets/images/icons/admin-portal.png" className="wid35" alt="adminportal" /> Admin Portal
            </h5>
            <hr className="my-4 w-100 mx-auto"></hr>
            <li><Link to="/AdminPage">Dashboard</Link></li>
            <li><Link to="/Profile">See Profile</Link></li>
            <li><Link to="/admin/ManageUsers">Manage Users</Link></li>
            <li><Link to="/admin/appointments">View All Appointments</Link></li>
            <li><Link to="/admin/Contact">Contact Details</Link></li>
            <hr className="my-4 w-100 mx-auto"></hr>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
