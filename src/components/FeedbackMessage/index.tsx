import React, { useEffect, useState } from 'react';
import './styles.css';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessageProps {
  message: string;
  type?: MessageType;
  duration?: number; // in milliseconds, 0 for persistent
  onClose?: () => void;
  showIcon?: boolean;
}

/**
 * An accessible feedback message component for notifications
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  showIcon = true
}) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Announce message to screen readers
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
    
    // Auto-dismiss after duration (if not persistent)
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);
  
  if (!visible) return null;
  
  // Get icon based on message type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  // Get appropriate ARIA role based on message type
  const getAriaRole = () => {
    switch (type) {
      case 'error':
        return 'alert';
      default:
        return 'status';
    }
  };
  
  return (
    <div 
      className={`feedback-message feedback-message-${type}`}
      role={getAriaRole()}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <span className="feedback-icon" aria-hidden="true">
          {getIcon()}
        </span>
      )}
      <span className="feedback-text">{message}</span>
      {duration === 0 && (
        <button 
          className="feedback-close-btn"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Close message"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default FeedbackMessage;