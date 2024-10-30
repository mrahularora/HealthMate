import React, { useState } from 'react';
import '../../css/doctorProfile.css'; // Ensure to create this file with the same styles as userProfile.css
import Sidebar from '../common/Sidebar';

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@hospital.com',
    specialization: 'Cardiology',
    experience: '10 Years',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log('Changes saved:', formData); // Just for demonstration
  };

  return (
    <div className="doctor-profile-container">
      <Sidebar />
      <div className="doctor-profile">
        <h2 className="title">Doctor Profile</h2>
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
                />
              </div>
              <div>
                <label>Specialization:</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Experience:</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>
              <button onClick={handleSaveChanges}>Save Changes</button>
            </>
          ) : (
            <>
              <p><strong>First Name:</strong> {formData.firstName}</p>
              <p><strong>Last Name:</strong> {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Specialization:</strong> {formData.specialization}</p>
              <p><strong>Experience:</strong> {formData.experience}</p>
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
