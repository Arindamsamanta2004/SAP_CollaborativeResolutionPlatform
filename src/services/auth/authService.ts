import apiClient from '../api/apiClient';
import { User } from '../../models/types';

/**
 * Authentication Service for handling auth-related API calls
 */
export const authService = {
  /**
   * Login user
   */
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get current user
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};