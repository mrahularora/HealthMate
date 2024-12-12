import React from 'react';
import '../css/userpage.css';
import '../css/sidebar.css';
import DoctorListComponent from '../components/user/UserDoctorsList';

const UserPage = () => {
  return (
    <div className="user-page">
      <DoctorListComponent />
    </div>
  );
};

export default UserPage;
