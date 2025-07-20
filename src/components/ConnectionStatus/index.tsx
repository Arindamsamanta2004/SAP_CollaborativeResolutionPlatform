import React from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import './styles.css';

/**
 * ConnectionStatus component displays the current WebSocket connection status
 * and provides a reconnect button when disconnected.
 */
const ConnectionStatus: React.FC = () => {
  const { isConnected, reconnect } = useAppState();

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="connection-indicator"></div>
      <span className="connection-text">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      {!isConnected && (
        <button className="reconnect-button" onClick={reconnect}>
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;