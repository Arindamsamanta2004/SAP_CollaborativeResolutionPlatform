import apiClient from './apiClient';
import { WorkCenter } from '../../models/types';

/**
 * Work Center Service for handling Work Center-related API calls
 */
export const workCenterService = {
  /**
   * Get all Work Centers
   */
  getAllWorkCenters: async (): Promise<WorkCenter[]> => {
    const response = await apiClient.get('/workcenters');
    return response.data;
  },

  /**
   * Get Work Center by ID
   */
  getWorkCenterById: async (id: string): Promise<WorkCenter> => {
    const response = await apiClient.get(`/workcenters/${id}`);
    return response.data;
  },

  /**
   * Get Work Center capacity
   */
  getWorkCenterCapacity: async (id: string, startDate: string, endDate: string): Promise<any> => {
    const response = await apiClient.get(`/workcenters/${id}/capacity`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};