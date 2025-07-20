import React from 'react';
import './styles.css';

interface LoadingStateProps {
  loading?: boolean;
  text?: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  ariaLabel?: string;
  progress?: number;
  progressText?: string;
  children?: React.ReactNode;
}

/**
 * A reusable loading state component with accessibility features
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  loading = true,
  text,
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
  ariaLabel = 'Content is loading',
  progress,
  progressText,
  children
}) => {
  const displayMessage = text || message;
  
  if (!loading && children) {
    return <>{children}</>;
  }
  
  return (
    <div 
      className={`loading-state ${fullScreen ? 'loading-state-fullscreen' : ''}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={`loading-spinner loading-spinner-${size}`} aria-hidden="true"></div>
      <p className="loading-message">{displayMessage}</p>
      {progress !== undefined && (
        <div className="loading-progress">
          <div className="loading-progress-bar" style={{ width: `${progress}%` }}></div>
          {progressText && <span className="loading-progress-text">{progressText}</span>}
        </div>
      )}
      <span className="sr-only">{ariaLabel}</span>
      {loading && children}
    </div>
  );
};

export default LoadingState;