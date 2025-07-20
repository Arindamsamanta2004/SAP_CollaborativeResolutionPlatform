import { localStorageService } from '../storage/localStorageService';

/**
 * System status interface
 */
export interface SystemStatus {
  networkConnected: boolean;
  serverAvailable: boolean;
  lastChecked: Date;
  features: Record<string, boolean>;
}

/**
 * Default system status
 */
const defaultSystemStatus: SystemStatus = {
  networkConnected: true,
  serverAvailable: true,
  lastChecked: new Date(),
  features: {
    ticketSubmission: true,
    ticketClassification: true,
    threadDecomposition: true,
    engineerAssignment: true,
    fileUpload: true,
    realTimeUpdates: true
  }
};

/**
 * System Status Service
 * Manages system status and provides degradation handling
 */
export const systemStatusService = {
  /**
   * Get current system status
   * @returns Current system status
   */
  getStatus: (): SystemStatus => {
    const storedStatus = localStorageService.getItem<SystemStatus>('systemStatus');
    return storedStatus || { ...defaultSystemStatus };
  },

  /**
   * Update system status
   * @param status Partial system status to update
   * @returns Updated system status
   */
  updateStatus: (status: Partial<SystemStatus>): SystemStatus => {
    const currentStatus = systemStatusService.getStatus();
    const updatedStatus = {
      ...currentStatus,
      ...status,
      lastChecked: new Date(),
      features: {
        ...currentStatus.features,
        ...(status.features || {})
      }
    };
    
    localStorageService.setItem('systemStatus', updatedStatus);
    return updatedStatus;
  },

  /**
   * Check if a feature is available
   * @param featureId Feature identifier
   * @returns True if the feature is available
   */
  isFeatureAvailable: (featureId: string): boolean => {
    const status = systemStatusService.getStatus();
    
    // If network is down, most features are unavailable
    if (!status.networkConnected) {
      // Only allow features that can work offline
      const offlineFeatures = ['ticketViewing'];
      return offlineFeatures.includes(featureId);
    }
    
    // If server is down, most features are unavailable
    if (!status.serverAvailable) {
      // Only allow features that can work without server
      const clientSideFeatures = ['ticketViewing', 'systemStatus'];
      return clientSideFeatures.includes(featureId);
    }
    
    // Check specific feature status
    return status.features[featureId] !== false;
  },

  /**
   * Check network connectivity
   * @returns Promise resolving to true if network is connected
   */
  checkNetworkConnectivity: async (): Promise<boolean> => {
    try {
      // In a real app, this would ping a server or check navigator.onLine
      const isOnline = navigator.onLine;
      
      // Update system status
      systemStatusService.updateStatus({
        networkConnected: isOnline
      });
      
      return isOnline;
    } catch (error) {
      console.error('Error checking network connectivity:', error);
      
      // Update system status
      systemStatusService.updateStatus({
        networkConnected: false
      });
      
      return false;
    }
  },

  /**
   * Check server availability
   * @returns Promise resolving to true if server is available
   */
  checkServerAvailability: async (): Promise<boolean> => {
    try {
      // In a real app, this would ping the server API
      // For demo, we'll simulate server availability
      const isServerAvailable = Math.random() > 0.05; // 5% chance of server being down
      
      // Update system status
      systemStatusService.updateStatus({
        serverAvailable: isServerAvailable
      });
      
      return isServerAvailable;
    } catch (error) {
      console.error('Error checking server availability:', error);
      
      // Update system status
      systemStatusService.updateStatus({
        serverAvailable: false
      });
      
      return false;
    }
  },

  /**
   * Simulate system degradation for demo purposes
   * @param featureId Feature to degrade
   * @param duration Duration in milliseconds
   * @returns Promise resolving when degradation is complete
   */
  simulateDegradation: async (
    featureId: string,
    duration: number = 30000
  ): Promise<void> => {
    // Update feature status
    const features: Record<string, boolean> = {};
    features[featureId] = false;
    
    systemStatusService.updateStatus({ features });
    
    // Restore after duration
    return new Promise(resolve => {
      setTimeout(() => {
        const restoreFeatures: Record<string, boolean> = {};
        restoreFeatures[featureId] = true;
        
        systemStatusService.updateStatus({ features: restoreFeatures });
        resolve();
      }, duration);
    });
  },

  /**
   * Get fallback data for a degraded feature
   * @param featureId Feature identifier
   * @returns Fallback data or null if not available
   */
  getFallbackData: (featureId: string): any => {
    // Try to get cached data from local storage
    const cachedData = localStorageService.getItem<any>(`${featureId}Cache`);
    if (cachedData) {
      return cachedData;
    }
    
    // Return empty fallback data
    switch (featureId) {
      case 'ticketList':
        return [];
      case 'engineerList':
        return [];
      case 'threadList':
        return [];
      default:
        return null;
    }
  },

  /**
   * Cache data for fallback
   * @param featureId Feature identifier
   * @param data Data to cache
   */
  cacheDataForFallback: (featureId: string, data: any): void => {
    localStorageService.setItem(`${featureId}Cache`, data);
  }
};

/**
 * Initialize system status monitoring
 * Sets up periodic checks for system status
 */
export const initializeSystemMonitoring = (): (() => void) => {
  // Initial check
  systemStatusService.checkNetworkConnectivity();
  systemStatusService.checkServerAvailability();
  
  // Set up periodic checks
  const networkCheckInterval = setInterval(() => {
    systemStatusService.checkNetworkConnectivity();
  }, 30000); // Check every 30 seconds
  
  const serverCheckInterval = setInterval(() => {
    systemStatusService.checkServerAvailability();
  }, 60000); // Check every minute
  
  // Return cleanup function
  return () => {
    clearInterval(networkCheckInterval);
    clearInterval(serverCheckInterval);
  };
};