import React, { useState } from 'react';
import { login } from '../services/authService'; 
import { useNavigate } from 'react-router-dom'; 
import '../css/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (email === '' || password === '') {
      setErrorMessage('Please fill in all fields.');
    } else {
      setErrorMessage('');
      
      try {
        const response = await login({ email, password });
        console.log('Login successful:', response.message);
        
     
        setSuccessMessage('Login successful! Redirecting...');
        
     
        navigate('/userpage');

      } catch (error) {
        setErrorMessage(error.message || 'Login failed, please try again.');
      }
    }
  };
  
  return (
    <div className="login-form-container">
      <h2 className="mb-4">Login</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>} {/* Display success message */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address<span className="red">* </span>:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password<span className="red">* </span>:</label>
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <a href="/signup">Create an Account</a> | <a href="/forgotpassword">Forgot Password</a> 
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
}

export default Login;
