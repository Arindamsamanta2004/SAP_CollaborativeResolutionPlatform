import apiClient from './apiClient';
import { CRP } from '../../models/types';

/**
 * CRP Service for handling CRP-related API calls
 */
export const crpService = {
  /**
   * Get all CRPs
   */
  getAllCRPs: async (): Promise<CRP[]> => {
    const response = await apiClient.get('/crp');
    return response.data;
  },

  /**
   * Get CRP by ID
   */
  getCRPById: async (id: string): Promise<CRP> => {
    const response = await apiClient.get(`/crp/${id}`);
    return response.data;
  },

  /**
   * Create a new CRP
   */
  createCRP: async (crp: Omit<CRP, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRP> => {
    const response = await apiClient.post('/crp', crp);
    return response.data;
  },

  /**
   * Update an existing CRP
   */
  updateCRP: async (id: string, crp: Partial<CRP>): Promise<CRP> => {
    const response = await apiClient.put(`/crp/${id}`, crp);
    return response.data;
  },

  /**
   * Delete a CRP
   */
  deleteCRP: async (id: string): Promise<void> => {
    await apiClient.delete(`/crp/${id}`);
  }
};