import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // 1. Initialize user state from local storage immediately (for persistence)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Sync user and loading state
  useEffect(() => {
    // If the user is already loaded from storage, just mark loading as false
    if (user) {
        setLoading(false);
        // Optional: Re-fetch profile to ensure token is still valid
        const checkTokenValidity = async () => {
            try {
                await api.get('authentication/profile/');
            } catch (error) {
                console.error("Token invalid, logging out.");
                logout();
            }
        };
        checkTokenValidity();
    } else {
        // If no user in storage, stop loading state
        setLoading(false);
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('authentication/login/', { email, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const profileRes = await api.get('authentication/profile/');
      const userData = profileRes.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Save the full object
      
      // FIX: Save admin status separately for public access on HomePage
      localStorage.setItem('is_admin', userData.is_superuser); 
      
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.response?.data?.detail || "Invalid credentials" };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await api.post('authentication/register/', userData);
      const { tokens, user: newUser } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser)); // Save the full object
      
      // FIX: Save admin status separately
      localStorage.setItem('is_admin', newUser.is_superuser);
      
      return { success: true };
    } catch (error) {
      // Extract error message safely
      let msg = "Registration failed";
      if (error.response?.data) {
        const values = Object.values(error.response.data);
        msg = Array.isArray(values[0]) ? values[0][0] : values[0];
      }
      return { success: false, msg };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_admin'); // Clean up admin flag
  };

  // Update Profile (with Image)
  const updateProfile = async (formData) => {
    try {
      const response = await api.put('authentication/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data);
      // Ensure the is_admin flag stays updated if profile refresh happens
      localStorage.setItem('is_admin', response.data.is_superuser); 
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return { success: false, msg: "Failed to update profile" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);