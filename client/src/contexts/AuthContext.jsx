import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch {
      // Ignore logout API error if token expired
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [token]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const hasRole = useCallback((roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
