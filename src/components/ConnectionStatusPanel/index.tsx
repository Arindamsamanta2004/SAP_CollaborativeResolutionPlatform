import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Button,
  Icon,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems
} from '@ui5/webcomponents-react';
import { useAppState } from '../../contexts/AppStateContext';
import './styles.css';

/**
 * ConnectionStatusPanel component displays detailed connection status information
 * and provides controls for reconnecting and managing the connection.
 */
const ConnectionStatusPanel: React.FC = () => {
  const { isConnected, reconnect, appState } = useAppState();
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  
  // Track connection status changes
  useEffect(() => {
    if (isConnected) {
      setLastConnected(new Date());
    } else if (lastConnected) {
      setConnectionAttempts(prev => prev + 1);
    }
  }, [isConnected]);

  // Format time difference
  const formatTimeDiff = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <Card className="connection-status-panel">
      <FlexBox 
        direction={FlexBoxDirection.Row} 
        justifyContent={FlexBoxJustifyContent.SpaceBetween}
        alignItems={FlexBoxAlignItems.Center}
        className="connection-status-header"
      >
        <Title level="H3">Connection Status</Title>
        <div className={`connection-status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className="connection-status-dot"></div>
          <Text>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </div>
      </FlexBox>
      
      <div className="connection-status-content">
        <div className="connection-status-info">
          <div className="connection-status-item">
            <Icon name="history" className="connection-status-icon" />
            <div className="connection-status-text">
              <Text className="connection-status-label">Last Activity:</Text>
              <Text className="connection-status-value">{formatTimeDiff(appState.lastActivity)}</Text>
            </div>
          </div>
          
          <div className="connection-status-item">
            <Icon name="connected" className="connection-status-icon" />
            <div className="connection-status-text">
              <Text className="connection-status-label">Last Connected:</Text>
              <Text className="connection-status-value">{formatTimeDiff(lastConnected)}</Text>
            </div>
          </div>
          
          <div className="connection-status-item">
            <Icon name="refresh" className="connection-status-icon" />
            <div className="connection-status-text">
              <Text className="connection-status-label">Connection Attempts:</Text>
              <Text className="connection-status-value">{connectionAttempts}</Text>
            </div>
          </div>
        </div>
        
        <div className="connection-status-actions">
          <Button 
            design="Emphasized" 
            icon="refresh"
            onClick={reconnect}
            disabled={isConnected}
          >
            Reconnect
          </Button>
          
          <Button 
            design="Transparent" 
            icon="reset"
            onClick={() => window.location.reload()}
          >
            Reset Application
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ConnectionStatusPanel;