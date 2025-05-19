import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false); 
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { token: newToken, ...userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData); 
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (nickname, email, password) => {
    try {
      const response = await api.post('/users/register', { nickname, email, password });
      const { token: newToken, ...userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Register error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const storeTokenAndDecodeUser = (receivedToken) => {
    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);
  };

  const fetchUserProfile = async () => {
    if (token && !user) {
        try {
            const response = await api.get('/users/profile');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user profile, possibly invalid token:", error);
            logout(); 
        }
    }
  };

  useEffect(() => {
    if (token && !user && !loading) {
        fetchUserProfile();
    }
  }, [token, user, loading]);


  const value = {
    user,
    token,
    isAuthenticated: !!token, 
    loading,
    login,
    register,
    logout,
    storeTokenAndDecodeUser,
    fetchUserProfile 
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};