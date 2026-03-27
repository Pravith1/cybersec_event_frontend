import { createContext, useContext, useState, useEffect } from 'react';
import { signup as apiSignup, login as apiLogin, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('cc_token'));

  const persistAuth = (userData, tokenStr) => {
    localStorage.setItem('cc_user', JSON.stringify(userData));
    localStorage.setItem('cc_token', tokenStr);
    setUser(userData);
    setToken(tokenStr);
  };

  const clearAuth = () => {
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
    setUser(null);
    setToken(null);
  };

  const signup = async (data) => {
    const res = await apiSignup(data);
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  const login = async (data) => {
    const res = await apiLogin(data);
    persistAuth(res.data.user, res.data.token);
    return res.data;
  };

  const logout = async () => {
    try { await apiLogout(); } catch (e) { /* ignore */ }
    clearAuth();
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
