import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from './useAuth'; // Import the useAuth hook

const ProtectedRoute = ({ component: Component, allowedRoles }) => {
  const { user } = useAuth(); // Use the custom hook to access user

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component />;
};

export default ProtectedRoute;
