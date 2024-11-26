import React from 'react';
import Sidebar from '../components/common/Sidebar';
import CreateAppointment from '../components/doctor/CreateAppointment';
import '../css/sidebar.css';
import '../css/createappointment.css';

const CreateAppointments = () => {
  return (
    <div className="doctor-page">
      <Sidebar />
      <CreateAppointment />
    </div>
  );
};

export default CreateAppointments;
