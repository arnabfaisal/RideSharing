import React, { createContext, useState, useContext, useEffect } from 'react';
import { post, get } from '../services/api';

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('rs_token');
    if (token) {
      try {
        const res = await get('/api/auth/me', true);
        if (res.success) {
          setUser(res.data);
        }
      } catch (error) {
        localStorage.removeItem('rs_token');
        localStorage.removeItem('rs_user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await post('/api/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('rs_token', res.token);
      localStorage.setItem('rs_user', JSON.stringify(res.user));
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await post('/api/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('rs_token');
    localStorage.removeItem('rs_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};