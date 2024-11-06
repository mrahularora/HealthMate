import React from 'react';
import Sidebar from '../components/common/Sidebar';
import '../css/userpage.css';
import '../css/sidebar.css';
import UserDashboard from '../components/user/UserDashboard';

const UserPage = () => {
  return (
    <div className="user-page">
      <Sidebar />
      <UserDashboard />
    </div>
  );
};

export default UserPage;
