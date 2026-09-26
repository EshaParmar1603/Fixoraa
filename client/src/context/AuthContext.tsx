import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  isCustomer: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  loginAsDemo: (demoRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fixora_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('fixora_token');
      const storedUser = localStorage.getItem('fixora_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Attempt fresh profile fetch in background
          const freshUser = await authApi.getMe();
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('fixora_user', JSON.stringify(freshUser));
          }
        } catch (e) {
          console.warn('Session verification fallback to stored user profile');
        }
      } else {
        // Automatically default to Customer demo user so app is immediately usable
        const defaultDemoUser: User = {
          id: 'user-cust-1',
          email: 'customer@fixora.com',
          name: 'Sophia Miller',
          role: 'CUSTOMER',
          isActive: true,
          phone: '+91 98765 43210',
          city: 'Bengaluru',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          createdAt: '2023-01-01'
        };
        const demoToken = 'mock-jwt-customer-initial';
        setUser(defaultDemoUser);
        setToken(demoToken);
        localStorage.setItem('fixora_token', demoToken);
        localStorage.setItem('fixora_user', JSON.stringify(defaultDemoUser));
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('fixora_token', res.token);
      localStorage.setItem('fixora_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('fixora_token', res.token);
      localStorage.setItem('fixora_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixora_token');
    localStorage.removeItem('fixora_user');
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getMe();
      if (profile) {
        setUser(profile);
        localStorage.setItem('fixora_user', JSON.stringify(profile));
      }
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  const updateProfile = async (data: any) => {
    const updated = await authApi.updateProfile(data);
    setUser(prev => prev ? { ...prev, ...updated } : updated);
    localStorage.setItem('fixora_user', JSON.stringify(user));
  };

  const loginAsDemo = async (demoRole: Role) => {
    const demoEmail = demoRole === 'ADMIN'
      ? 'admin@fixora.com'
      : demoRole === 'PROVIDER'
      ? 'provider@fixora.com'
      : 'customer@fixora.com';
    await login(demoEmail, 'Password123!');
  };

  const role = user?.role || null;
  const isCustomer = role === 'CUSTOMER';
  const isProvider = role === 'PROVIDER';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role,
        isCustomer,
        isProvider,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
        loginAsDemo,
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
