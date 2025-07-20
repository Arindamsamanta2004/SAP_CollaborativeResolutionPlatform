import React, { useState, useEffect } from 'react';
import {
  MessageStrip,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon
} from '@ui5/webcomponents-react';
import { systemStatusService, SystemStatus } from '../../services/system/systemStatusService';
import '@ui5/webcomponents-icons/dist/alert.js';
import '@ui5/webcomponents-icons/dist/error.js';
import '@ui5/webcomponents-icons/dist/information.js';
import './styles.css';

interface SystemStatusBannerProps {
  onRetry?: () => void;
}

const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({ onRetry }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(systemStatusService.getStatus());
  const [visible, setVisible] = useState(false);
  
  // Check if banner should be shown
  const shouldShowBanner = (): boolean => {
    return !systemStatus.networkConnected || 
           !systemStatus.serverAvailable || 
           Object.values(systemStatus.features).some(status => status === false);
  };
  
  // Get banner message
  const getBannerMessage = (): string => {
    if (!systemStatus.networkConnected) {
      return 'Network connection lost. Some features may be unavailable.';
    }
    
    if (!systemStatus.serverAvailable) {
      return 'Server connection issues. Working with limited functionality.';
    }
    
    // Check for degraded features
    const degradedFeatures = Object.entries(systemStatus.features)
      .filter(([_, status]) => status === false)
      .map(([feature, _]) => feature);
    
    if (degradedFeatures.length > 0) {
      return `Limited functionality: ${degradedFeatures.join(', ')} ${degradedFeatures.length > 1 ? 'are' : 'is'} currently unavailable.`;
    }
    
    return '';
  };
  
  // Get banner design
  const getBannerDesign = (): string => {
    if (!systemStatus.networkConnected || !systemStatus.serverAvailable) {
      return "Negative";
    }
    
    return "Critical";
  };
  
  // Handle retry
  const handleRetry = () => {
    // Check network and server status
    systemStatusService.checkNetworkConnectivity();
    systemStatusService.checkServerAvailability();
    
    // Update state
    setSystemStatus(systemStatusService.getStatus());
    
    // Call onRetry if provided
    if (onRetry) {
      onRetry();
    }
  };
  
  // Update system status periodically
  useEffect(() => {
    const updateStatus = () => {
      setSystemStatus(systemStatusService.getStatus());
      setVisible(shouldShowBanner());
    };
    
    // Initial update
    updateStatus();
    
    // Set up interval
    const interval = setInterval(updateStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update visibility when status changes
  useEffect(() => {
    setVisible(shouldShowBanner());
  }, [systemStatus]);
  
  if (!visible) {
    return null;
  }
  
  return (
    <div className="system-status-banner">
      <MessageStrip
        design={!systemStatus.networkConnected || !systemStatus.serverAvailable ? "Negative" : "Critical"}
        hideCloseButton={false}
        onClose={() => setVisible(false)}
        className="status-message-strip"
      >
        <FlexBox
          direction={FlexBoxDirection.Row}
          justifyContent={FlexBoxJustifyContent.SpaceBetween}
          alignItems={FlexBoxAlignItems.Center}
          className="status-content"
        >
          <div className="status-message">
            <Icon 
              name={!systemStatus.networkConnected || !systemStatus.serverAvailable ? "error" : "alert"} 
              className="status-icon"
            />
            <span>{getBannerMessage()}</span>
          </div>
          
          <Button
            design="Transparent"
            onClick={handleRetry}
            className="retry-button"
          >
            Retry Connection
          </Button>
        </FlexBox>
      </MessageStrip>
    </div>
  );
};

export default SystemStatusBanner;