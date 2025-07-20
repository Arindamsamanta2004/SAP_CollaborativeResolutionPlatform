import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      let currentUser = authService.getCurrentUser();

      // For demo purposes, auto-login if no user is found
      if (!currentUser) {
        const demoUser = {
          id: 'demo-user-1',
          username: 'demo.user',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@sap.com',
          role: 'Lead Engineer',
          department: 'IT Support'
        };

        // Store demo user in localStorage
        localStorage.setItem('auth_token', 'demo-token-123');
        localStorage.setItem('user', JSON.stringify(demoUser));
        currentUser = demoUser;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await authService.login(username, password);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};