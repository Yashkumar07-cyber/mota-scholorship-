import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginStudent: (mobile: string, otp: string) => Promise<void>;
  loginAdmin: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mota_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mota_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('mota_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const loginStudent = async (mobile: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { mobile, otp });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('mota_auth_token', newToken);
      localStorage.setItem('mota_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('mota_auth_token', newToken);
      localStorage.setItem('mota_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mota_auth_token');
    localStorage.removeItem('mota_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'VERIFICATION_OFFICER';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loginStudent,
        loginAdmin,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
