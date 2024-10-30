// src/context/RedirectIfAuthenticated.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const RedirectIfAuthenticated = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    // If the user is logged in, redirect them to a different page (e.g., homepage)
    return <Navigate to="/" />;
  }

  // If not logged in, render the children components (e.g., Login or Sign Up page)
  return children;
};

export default RedirectIfAuthenticated;