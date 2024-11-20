import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Pateints from '../components/doctor/Patients';

import '../css/doctorpage.css';
import '../css/sidebar.css';

const DoctorPage = () => {
  return (
    <div className="doctor-page">
      <Sidebar />
      <Pateints />
    </div>
  );
};

export default DoctorPage;
