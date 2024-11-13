import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from './useAuth'; 

const ProtectedRoute = ({ component: Component, allowedRoles }) => {
  const { user } = useAuth(); 

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component />;
};

export default ProtectedRoute;
