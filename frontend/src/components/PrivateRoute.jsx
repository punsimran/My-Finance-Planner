import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // If user is null (not logged in), send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, render the dashboard
  return children;
};

export default PrivateRoute;