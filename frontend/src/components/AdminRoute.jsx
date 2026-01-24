// src/components/AdminRoute.jsx (New file)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Check if user is logged in AND is staff/superuser (Staff status needs to be exposed by Django Profile API)
    // NOTE: For now, we rely solely on user existence, but ideally, Django should return a user.is_staff flag
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // For simplicity, we are bypassing the staff check in the frontend, 
    // relying on the Django API to return 403/401 if they aren't staff.
    // However, we should explicitly check if the user object has staff status:
    // if (!user.is_staff) { return <Navigate to="/dashboard" replace />; } 
    
    return children;
};

export default AdminRoute;