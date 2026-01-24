import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    
    return children;
};

export default AdminRoute;