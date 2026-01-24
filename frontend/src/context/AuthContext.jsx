import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);


  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });


  useEffect(() => {

    if (user) {
        setLoading(false);

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
      localStorage.setItem('user', JSON.stringify(userData));
      

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
      localStorage.setItem('user', JSON.stringify(newUser));
      

      localStorage.setItem('is_admin', newUser.is_superuser);
      
      return { success: true };
    } catch (error) {

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
    localStorage.removeItem('is_admin'); 
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