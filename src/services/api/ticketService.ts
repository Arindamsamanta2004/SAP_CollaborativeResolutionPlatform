import apiClient from './apiClient';
import { Ticket, UrgencyLevel, AffectedSystem, Attachment } from '../../models/types';
import { generateTicketId } from '../../utils/dataUtils';
import { mockTickets } from '../../models/mockData/tickets';
import { systemStatusService } from '../system/systemStatusService';
import { errorHandlingService, ErrorType } from '../error/errorHandlingService';
import { createError, networkErrorHandling } from '../error/errorUtils';
import { localStorageService } from '../storage/localStorageService';

// Retry strategy for API calls
const retryStrategy = networkErrorHandling.createRetryStrategy(3, 1000);

/**
 * Ticket Service for handling ticket-related API calls
 */
export const ticketService = {
  /**
   * Get all tickets
   */
  getAllTickets: async (): Promise<Ticket[]> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketViewing')) {
        // Use cached data if available
        const cachedTickets = systemStatusService.getFallbackData('ticketList');
        if (cachedTickets && Array.isArray(cachedTickets)) {
          return cachedTickets;
        }
        
        throw new Error('Ticket viewing is currently unavailable');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // const response = await apiClient.get('/tickets');
        // return response.data;
        
        // For demo purposes, return mock data
        const tickets = [...mockTickets];
        
        // Cache data for fallback
        systemStatusService.cacheDataForFallback('ticketList', tickets);
        
        return tickets;
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      
      // Try to get cached data
      const cachedTickets = systemStatusService.getFallbackData('ticketList');
      if (cachedTickets && Array.isArray(cachedTickets)) {
        return cachedTickets;
      }
      
      // Create and throw error
      const appError = createError(
        ErrorType.NETWORK,
        'error',
        'Failed to fetch tickets',
        error instanceof Error ? error.message : 'Unknown error',
        'FETCH_TICKETS_FAILED'
      );
      
      throw appError;
    }
  },

  /**
   * Get ticket by ID
   */
  getTicketById: async (id: string): Promise<Ticket | undefined> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketViewing')) {
        // Try to get from local cache
        const cachedTickets = systemStatusService.getFallbackData('ticketList');
        if (cachedTickets && Array.isArray(cachedTickets)) {
          return cachedTickets.find(t => t.id === id);
        }
        
        throw new Error('Ticket viewing is currently unavailable');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // const response = await apiClient.get(`/tickets/${id}`);
        // return response.data;
        
        // For demo purposes, return mock data
        const ticket = mockTickets.find(t => t.id === id);
        
        // If ticket found, cache it individually
        if (ticket) {
          localStorageService.setItem(`ticket_${id}`, ticket);
        }
        
        return ticket;
      });
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      
      // Try to get from local cache
      const cachedTicket = localStorageService.getItem<Ticket>(`ticket_${id}`);
      if (cachedTicket) {
        return cachedTicket;
      }
      
      // Create and throw error
      const appError = createError(
        ErrorType.NETWORK,
        'error',
        `Failed to fetch ticket ${id}`,
        error instanceof Error ? error.message : 'Unknown error',
        'FETCH_TICKET_FAILED'
      );
      
      throw appError;
    }
  },

  /**
   * Create a new ticket
   */
  createTicket: async (ticketData: {
    subject: string;
    description: string;
    urgency: UrgencyLevel;
    affectedSystem: AffectedSystem;
    attachments: File[];
  }): Promise<Ticket> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketSubmission')) {
        // Store in pending submissions
        const pendingSubmission = {
          data: ticketData,
          timestamp: new Date().toISOString()
        };
        
        const pendingSubmissions = localStorageService.getItem<any[]>('pendingTicketSubmissions') || [];
        pendingSubmissions.push(pendingSubmission);
        localStorageService.setItem('pendingTicketSubmissions', pendingSubmissions);
        
        throw new Error('Ticket submission is currently unavailable. Your submission has been saved and will be processed when the service is available.');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // const formData = new FormData();
        // formData.append('subject', ticketData.subject);
        // formData.append('description', ticketData.description);
        // formData.append('urgency', ticketData.urgency);
        // formData.append('affectedSystem', ticketData.affectedSystem);
        // ticketData.attachments.forEach(file => {
        //   formData.append('attachments', file);
        // });
        // const response = await apiClient.post('/tickets', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });
        // return response.data;
        
        // For demo purposes, create a mock ticket
        const now = new Date();
        const attachments: Attachment[] = ticketData.attachments.map((file, index) => ({
          id: `att-new-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file) // Create a temporary URL for the file
        }));
        
        const newTicket: Ticket = {
          id: generateTicketId(),
          subject: ticketData.subject,
          description: ticketData.description,
          urgency: ticketData.urgency,
          affectedSystem: ticketData.affectedSystem,
          attachments,
          status: 'Submitted',
          createdAt: now,
          updatedAt: now
        };
        
        // Simulate network delay and random failure (5% chance)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Random failure simulation (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error('Network error during ticket submission'));
              return;
            }
            
            // Add to mock data (in a real app this would be handled by the backend)
            mockTickets.push(newTicket);
            
            // Update cached ticket list
            const cachedTickets = systemStatusService.getFallbackData('ticketList');
            if (cachedTickets && Array.isArray(cachedTickets)) {
              systemStatusService.cacheDataForFallback('ticketList', [...cachedTickets, newTicket]);
            }
            
            resolve(newTicket);
          }, 1500); // Simulate network delay
        });
      }, (attempt: number, error: any) => {
        console.log(`Retry attempt ${attempt} for ticket submission:`, error);
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      
      // Create and throw error
      const appError = createError(
        ErrorType.SERVER,
        'error',
        'Failed to submit ticket',
        error instanceof Error ? error.message : 'Unknown error',
        'CREATE_TICKET_FAILED'
      );
      
      throw appError;
    }
  },

  /**
   * Update an existing ticket
   */
  updateTicket: async (id: string, ticketData: Partial<Ticket>): Promise<Ticket | undefined> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketUpdating')) {
        // Store in pending updates
        const pendingUpdate = {
          id,
          data: ticketData,
          timestamp: new Date().toISOString()
        };
        
        const pendingUpdates = localStorageService.getItem<any[]>('pendingTicketUpdates') || [];
        pendingUpdates.push(pendingUpdate);
        localStorageService.setItem('pendingTicketUpdates', pendingUpdates);
        
        throw new Error('Ticket updating is currently unavailable. Your update has been saved and will be processed when the service is available.');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // const response = await apiClient.put(`/tickets/${id}`, ticketData);
        // return response.data;
        
        // For demo purposes, update mock data
        const ticketIndex = mockTickets.findIndex(t => t.id === id);
        if (ticketIndex === -1) return undefined;
        
        const updatedTicket = {
          ...mockTickets[ticketIndex],
          ...ticketData,
          updatedAt: new Date()
        };
        
        // Simulate network delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Random failure simulation (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error('Network error during ticket update'));
              return;
            }
            
            mockTickets[ticketIndex] = updatedTicket;
            
            // Update cached ticket
            localStorageService.setItem(`ticket_${id}`, updatedTicket);
            
            resolve(updatedTicket);
          }, 1000);
        });
      });
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      
      // Create and throw error
      const appError = createError(
        ErrorType.SERVER,
        'error',
        `Failed to update ticket ${id}`,
        error instanceof Error ? error.message : 'Unknown error',
        'UPDATE_TICKET_FAILED'
      );
      
      throw appError;
    }
  },

  /**
   * Delete a ticket
   */
  deleteTicket: async (id: string): Promise<boolean> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketDeletion')) {
        throw new Error('Ticket deletion is currently unavailable.');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // await apiClient.delete(`/tickets/${id}`);
        
        // For demo purposes, remove from mock data
        const ticketIndex = mockTickets.findIndex(t => t.id === id);
        if (ticketIndex === -1) return false;
        
        // Simulate network delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Random failure simulation (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error('Network error during ticket deletion'));
              return;
            }
            
            mockTickets.splice(ticketIndex, 1);
            
            // Remove from cached ticket list
            const cachedTickets = systemStatusService.getFallbackData('ticketList');
            if (cachedTickets && Array.isArray(cachedTickets)) {
              systemStatusService.cacheDataForFallback(
                'ticketList', 
                cachedTickets.filter(t => t.id !== id)
              );
            }
            
            // Remove cached ticket
            localStorageService.removeItem(`ticket_${id}`);
            
            resolve(true);
          }, 1000);
        });
      });
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      
      // Create and throw error
      const appError = createError(
        ErrorType.SERVER,
        'error',
        `Failed to delete ticket ${id}`,
        error instanceof Error ? error.message : 'Unknown error',
        'DELETE_TICKET_FAILED'
      );
      
      throw appError;
    }
  },

  /**
   * Complete ticket resolution
   * This function updates the ticket status to Resolved and stores the final merged solution
   */
  completeTicketResolution: async (id: string, mergedSolution: string): Promise<Ticket | undefined> => {
    try {
      // Check if feature is available
      if (!systemStatusService.isFeatureAvailable('ticketResolution')) {
        // Store in pending resolutions
        const pendingResolution = {
          id,
          mergedSolution,
          timestamp: new Date().toISOString()
        };
        
        const pendingResolutions = localStorageService.getItem<any[]>('pendingTicketResolutions') || [];
        pendingResolutions.push(pendingResolution);
        localStorageService.setItem('pendingTicketResolutions', pendingResolutions);
        
        throw new Error('Ticket resolution is currently unavailable. Your resolution has been saved and will be processed when the service is available.');
      }
      
      // In a real app, this would be an API call with retry strategy
      return await retryStrategy.execute(async () => {
        // const response = await apiClient.put(`/tickets/${id}/resolve`, { mergedSolution });
        // return response.data;
        
        // For demo purposes, update mock data
        const ticketIndex = mockTickets.findIndex(t => t.id === id);
        if (ticketIndex === -1) return undefined;
        
        const updatedTicket = {
          ...mockTickets[ticketIndex],
          status: 'Resolved' as const,
          resolution: mergedSolution,
          updatedAt: new Date(),
          resolvedAt: new Date()
        };
        
        // Simulate network delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Random failure simulation (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error('Network error during ticket resolution'));
              return;
            }
            
            mockTickets[ticketIndex] = updatedTicket;
            
            // Update cached ticket
            localStorageService.setItem(`ticket_${id}`, updatedTicket);
            
            resolve(updatedTicket);
          }, 1500);
        });
      });
    } catch (error) {
      console.error(`Error resolving ticket ${id}:`, error);
      
      // Create and throw error
      const appError = createError(
        ErrorType.SERVER,
        'error',
        `Failed to resolve ticket ${id}`,
        error instanceof Error ? error.message : 'Unknown error',
        'RESOLVE_TICKET_FAILED'
      );
      
      throw appError;
    }
  },
  
  /**
   * Process pending ticket operations
   * This function processes any pending ticket operations that were stored during system degradation
   */
  processPendingOperations: async (): Promise<void> => {
    try {
      // Process pending submissions
      const pendingSubmissions = localStorageService.getItem<any[]>('pendingTicketSubmissions') || [];
      if (pendingSubmissions.length > 0 && systemStatusService.isFeatureAvailable('ticketSubmission')) {
        console.log(`Processing ${pendingSubmissions.length} pending ticket submissions`);
        
        for (const submission of pendingSubmissions) {
          try {
            await ticketService.createTicket(submission.data);
          } catch (error) {
            console.error('Error processing pending submission:', error);
          }
        }
        
        // Clear processed submissions
        localStorageService.setItem('pendingTicketSubmissions', []);
      }
      
      // Process pending updates
      const pendingUpdates = localStorageService.getItem<any[]>('pendingTicketUpdates') || [];
      if (pendingUpdates.length > 0 && systemStatusService.isFeatureAvailable('ticketUpdating')) {
        console.log(`Processing ${pendingUpdates.length} pending ticket updates`);
        
        for (const update of pendingUpdates) {
          try {
            await ticketService.updateTicket(update.id, update.data);
          } catch (error) {
            console.error('Error processing pending update:', error);
          }
        }
        
        // Clear processed updates
        localStorageService.setItem('pendingTicketUpdates', []);
      }
      
      // Process pending resolutions
      const pendingResolutions = localStorageService.getItem<any[]>('pendingTicketResolutions') || [];
      if (pendingResolutions.length > 0 && systemStatusService.isFeatureAvailable('ticketResolution')) {
        console.log(`Processing ${pendingResolutions.length} pending ticket resolutions`);
        
        for (const resolution of pendingResolutions) {
          try {
            await ticketService.completeTicketResolution(resolution.id, resolution.mergedSolution);
          } catch (error) {
            console.error('Error processing pending resolution:', error);
          }
        }
        
        // Clear processed resolutions
        localStorageService.setItem('pendingTicketResolutions', []);
      }
    } catch (error) {
      console.error('Error processing pending operations:', error);
    }
  }
};