import React, { useState, useContext } from 'react';
import { login } from '../services/authService'; 
import { useNavigate } from 'react-router-dom'; 
import { AuthContext } from '../context/AuthContext'; 
import '../css/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const { login: setUser } = useContext(AuthContext); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (email === '' || password === '') {
      setErrorMessage('Please fill in all fields.');
    } else {
      setErrorMessage('');
      
      try {
        const response = await login({ email, password });
        console.log('Login successful:', response.message);
        
        setUser(response.user); // Pass the user object from the response

        setSuccessMessage('Login successful! Redirecting...');
        
        // Redirect based on user role
        const { role } = response.user;
        
        let redirectPath = '/'; // Default redirect path
        if (role === 'Admin') {
          redirectPath = '/adminpage'; // Redirect to Admin page
        } else if (role === 'User') {
          redirectPath = '/userpage'; // Redirect to User page
        } else if (role === 'Doctor') {
          redirectPath = '/doctor'
        }

        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);

      } catch (error) {
        setErrorMessage(error.message || 'Login failed, please try again.');
      }
    }
  };
  
  return (
    <div className="login-form-container">
      <h2 className="mb-4">Login</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
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
