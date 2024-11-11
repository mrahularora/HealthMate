import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const UserProfile = () => {
  const { user } = useContext(AuthContext); // Get user from auth context
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    role: "",
  });
  const [errors, setErrors] = useState({}); // For tracking specific field errors
  const [successMessage, setSuccessMessage] = useState(""); // For success message

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            withCredentials: true, // Ensure cookies are included in the request
          }
        );
        setFormData(response.data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setErrors({ general: error.response?.data?.message || "Failed to load profile data." });
      }
    };

    if (user) {
      fetchUserProfile(); // Fetch profile only if the user is logged in
    }
  }, [user]); // Re-fetch if user is updated

  // Validation for first and last name
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s\.\-']+$/; // Only letters, spaces, periods, apostrophes, and hyphens
    return nameRegex.test(name);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    let formErrors = {};

    // Validate first name
    if (!validateName(formData.firstName)) {
      formErrors.firstNameError = "First name may only contain letters and spaces.";
    }

    // Validate last name
    if (!validateName(formData.lastName)) {
      formErrors.lastNameError = "Last name may only contain letters and spaces.";
    }

    // Validate gender
    if (!formData.gender) {
      formErrors.genderError = "Please select a gender.";
    }

    // If there are validation errors, set them and return early
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        {
          withCredentials: true, // Ensure cookies are included in the request
        }
      );

      setFormData(response.data); // Update with the latest data
      setIsEditing(false);
      setErrors({}); // Clear any previous errors
      setSuccessMessage("Profile updated successfully!"); // Success message
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: error.response?.data?.message || "Failed to save changes. Please try again." });
      setSuccessMessage(""); // Clear success message if error occurs
    }
  };

  return (
    <div className="user-profile">
      <h2 className="title">User Profile</h2>
      {/* Display general error if exists */}
      {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
      
      {/* Display success message */}
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
              {/* Display first name error if exists, below the input */}
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
              {/* Display last name error if exists, below the input */}
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
              {/* Display gender error if exists */}
              {errors.genderError && <p style={{ color: "red" }}>{errors.genderError}</p>}
              <label>Gender:</label>
              <div className="gender-options">
                <div className="gender-option">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleInputChange}
                    />
                    Male
                  </label>
                </div>
                <div className="gender-option">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleInputChange}
                    />
                    Female
                  </label>
                </div>
                <div className="gender-option">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={handleInputChange}
                    />
                    Other
                  </label>
                </div>
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
            <p>
              <strong>First Name:</strong> {formData.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {formData.lastName}
            </p>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <p>
              <strong>Gender:</strong> {formData.gender}
            </p>
            <p>
              <strong>Role:</strong> {formData.role}
            </p>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
