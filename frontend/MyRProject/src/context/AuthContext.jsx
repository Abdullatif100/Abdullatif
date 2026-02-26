import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Check if user session is still valid on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedInUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      if (loggedInUser && accessToken) {
        try {
          const userData = JSON.parse(loggedInUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid JSON in localStorage - clear and logout
          logout();
        }
      } else {
        // Clear any partial auth data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();

    // Listen for auth errors from API interceptor
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
  };

  const register = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
