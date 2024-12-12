import React, { useState, useEffect } from 'react';
import { fetchStats, fetchDetails } from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [details, setDetails] = useState([]);
  const [activeType, setActiveType] = useState('');

  // Load statistics on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Fetch statistics
  const loadStats = async () => {
    try {
      const statsData = await fetchStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Fetch details for a specific type
  const loadDetails = async (type) => {
    try {
      const detailsData = await fetchDetails(type);
      setDetails(detailsData);
      setActiveType(type);
    } catch (error) {
      console.error(`Error loading details for type: ${type}`, error);
    }
  };

  return (
    <div className="admin-dashboard">
     <h1 className="greeting">Admin Dashboard</h1>
     <p>Welcome to Admin Dashboard, in which a summary view is provided of all key metrics and actionable insights concerning the system.
       This page allows for efficient monitoring and management of user data, appointments, and system activity.</p>

      {/* Statistics Section */}
      <div className="stats">
        <div onClick={() => loadDetails('totalUsers')}><img src="/assets/images/icons/users.png" alt="user" /><br />Total Users: {stats.totalUsers || 0}</div>
        <div onClick={() => loadDetails('users')}><img src="/assets/images/icons/patient.png" alt="patient" /><br />Normal Users: {stats.totalNormalUsers || 0}</div>
        <div onClick={() => loadDetails('doctors')}><img src="/assets/images/icons/doctor.png" alt="doctor" /><br />Total Doctors: {stats.totalDoctors || 0}</div>
        <div onClick={() => loadDetails('admins')}><img src="/assets/images/icons/admin-portal.png" alt="admin-portal" /><br />Total Admins: {stats.totalAdmins || 0}</div>
        <div onClick={() => loadDetails('appointments')}><img src="/assets/images/icons/doctor-portal.png" alt="doctor-portal" /><br />Total Appointments: {stats.totalAppointments || 0}</div>
      </div>

      {/* Details Section */}
      {activeType && (
        <div className="details">
          <h2>
            Details: {activeType === 'totalUsers' ? 'All Users' : activeType.charAt(0).toUpperCase() + activeType.slice(1)}
          </h2>
          <table>
            <thead>
              <tr>
                {activeType === 'appointments' ? (
                  <>
                    <th>Doctor Name</th>
                    <th>Date</th>
                    <th>Status</th>
                  </>
                ) : (
                  <>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {details.map((item, index) => (
                <tr key={index}>
                  {activeType === 'appointments' ? (
                    <>
                      <td>{item.doctorName || 'Unknown Doctor'}</td>
                      <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                      <td>{item.status || 'N/A'}</td>
                    </>
                  ) : (
                    <>
                      <td>{item.firstName || 'N/A'}</td>
                      <td>{item.lastName || 'N/A'}</td>
                      <td>{item.email || 'N/A'}</td>
                      <td>{item.role || 'N/A'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
