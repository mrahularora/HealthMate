import React, { useState } from 'react';
import '../../css/profile.css';
import Sidebar from '../common/Sidebar';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    role: 'User',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log('Changes saved:', formData);
  };

  return (
    <div className="user-profile-container">
      <Sidebar />
      <div className="user-profile">
        <h2 className="title">User Profile</h2>
        <div className="profile-info">
          {isEditing ? (
            <>
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div>
                <label>Gender:</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Role:</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                />
              </div>
              <button onClick={handleSaveChanges}>Save Changes</button>
            </>
          ) : (
            <>
              <p><strong>First Name:</strong> {formData.firstName}</p>
              <p><strong>Last Name:</strong> {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
              <p><strong>Role:</strong> {formData.role}</p>
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
