import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// 👇 Dynamic API base URL (works both locally and on Netlify)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (currentToken) => {
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      const res = await axios.get(`${API_BASE_URL}/users/profile`);
      setUser(res.data);
    } catch (err) {
      console.error('Profile fetch error', err);
      // If token is invalid, clear everything
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile(token);
  }, [token, fetchUserProfile]);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      const { access_token } = res.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      const profileRes = await axios.get(`${API_BASE_URL}/users/profile`);
      setUser(profileRes.data);

      return { success: true, message: 'Login successful!' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      return { success: false, message: errorMsg };
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { username, password });
      // Auto-login after registration
      return await login(username, password);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Username might already exist.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};