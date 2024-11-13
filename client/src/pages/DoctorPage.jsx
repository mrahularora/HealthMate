import React from 'react';
import Sidebar from '../components/common/Sidebar';
import DoctorDashboard from '../components/doctor/DoctorDashboard';
import CreateAppointment from '../components/doctor/CreateAppointment';
import '../css/doctorpage.css';
import '../css/sidebar.css';

const DoctorPage = () => {
  return (
    <div className="doctor-page">
      <Sidebar />
      <DoctorDashboard />
      <CreateAppointment />
    </div>
  );
};

export default DoctorPage;
