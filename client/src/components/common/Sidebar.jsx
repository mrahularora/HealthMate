import React from 'react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3 className="mb-4">User Features</h3>
      <ul>
        <li><a href="/user">Profile</a></li>
        <li><a href="/doctorslist">Doctor's List</a></li>
        <li><a href="/appointments">Current Appointments</a></li>
        <li><a href="/booknew">Book New Appointment</a></li>
        <li><a href="/editprofiledetails">Edit Profile Details</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
