import React from 'react';
import Sidebar from '../components/common/Sidebar';
import DoctorDashboard from '../components/doctor/DoctorDashboard';
import '../css/doctorpage.css';
import '../css/sidebar.css';

const DoctorPage = () => {
  return (
    <div className="doctor-page">
      <Sidebar />
      <DoctorDashboard />
    </div>
  );
};

export default DoctorPage;
