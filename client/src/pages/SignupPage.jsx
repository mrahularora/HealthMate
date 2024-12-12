import React, { useState } from 'react';
import { signup } from '../services/authService'; 
import '../css/signup.css'; 

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    gender: '',
    password: '',
    confirmPassword: '',
    role: 'User', // Default role
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, gender, role } = formData;

    // Validate form inputs
    if (!firstName || !lastName || !email || !confirmEmail || !password || !confirmPassword || !gender) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (email !== confirmEmail) {
      setErrorMessage('Email addresses do not match.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        gender,
        role,
      };

      await signup(userData); 

      setSuccessMessage('Signup successful! You can now log in.');

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        gender: '',
        password: '',
        confirmPassword: '',
        role: 'User', // Reset to default role
      });
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred during signup.');
    }
  };

  return (
    <div className="sign-main">
    <section className="sign-section">
      <div class="signup-container">
      <h2 className="mb-4"><img src="./assets/images/icons/adduser.png" className="wid35" alt="signup" />Signup</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name<span className="red">* </span>:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name<span className="red">* </span>:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address<span className="red">* </span>:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmEmail">Confirm Email Address<span className="red">* </span>:</label>
            <input
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              placeholder="Confirm Email Address"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gender">Gender<span className="red">* </span>:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="role">Role<span className="red">* </span>:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="User">User</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password<span className="red">* </span>:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password<span className="red">* </span>:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>
        </div>
        <button type="submit" className="signup-button">Signup</button>
      </form>
    </div>
    </section>
    </div>
  );
}

export default SignupPage;
