import React, { useState, useEffect} from "react";
import { editUser, updateUser } from '../../services/userService';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await editUser();
        setFormData(userData);
      } catch (error) {
        setErrors({ general: error.message });
      }
    };
    fetchData();
  }, []);

  const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    let formErrors = {};

    if (!validateName(formData.firstName)) {
      formErrors.firstNameError = "First name may only contain letters and spaces.";
    }

    if (!validateName(formData.lastName)) {
      formErrors.lastNameError = "Last name may only contain letters and spaces.";
    }

    if (!formData.gender) {
      formErrors.genderError = "Please select a gender.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await updateUser(formData);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setErrors({ general: error.message });
      setSuccessMessage("");
    }
  };

  return (
    <div className="user-profile">
      <h2 className="title">User Profile</h2>
      {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

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
                required
              />
              {errors.firstNameError && <p style={{ color: "red" }}>{errors.firstNameError}</p>}
            </div>
            <div>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              {errors.lastNameError && <p style={{ color: "red" }}>{errors.lastNameError}</p>}
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>
            <div>
              {errors.genderError && <p style={{ color: "red" }}>{errors.genderError}</p>}
              <label>Gender:</label>
              <div className="gender-options">
                {["Male", "Female", "Other"].map((gender) => (
                  <label key={gender}>
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={handleInputChange}
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label>Role:</label>
              <input type="text" name="role" value={formData.role} disabled />
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
  );
};

export default UserProfile;
