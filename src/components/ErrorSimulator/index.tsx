import React, { useState } from 'react';
import {
  Dialog,
  Button,
  List,

  Title,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  Bar,

  Label,
  Select,
  Option
} from '@ui5/webcomponents-react';
import { systemStatusService } from '../../services/system/systemStatusService';
import { errorHandlingService, ErrorType } from '../../services/error/errorHandlingService';
import { createError, createValidationError } from '../../services/error/errorUtils';
import FeedbackMessage from '../FeedbackMessage';
import '@ui5/webcomponents-icons/dist/error.js';
import '@ui5/webcomponents-icons/dist/warning.js';
import '@ui5/webcomponents-icons/dist/disconnected.js';
import './styles.css';

interface ErrorSimulatorProps {
  onErrorSimulated?: (errorType: string) => void;
}

const ErrorSimulator: React.FC<ErrorSimulatorProps> = ({ onErrorSimulated }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('system');
  const [simulatedError, setSimulatedError] = useState<any>(null);
  
  // Error categories
  const errorCategories = [
    { id: 'system', name: 'System Degradation' },
    { id: 'network', name: 'Network Errors' },
    { id: 'validation', name: 'Validation Errors' },
    { id: 'server', name: 'Server Errors' }
  ];
  
  // Simulate system degradation
  const simulateDegradation = (featureId: string, duration: number = 30000) => {
    systemStatusService.simulateDegradation(featureId, duration);
    setDialogOpen(false);
    
    if (onErrorSimulated) {
      onErrorSimulated(`degradation:${featureId}`);
    }
    
    // Show simulated error message
    setSimulatedError({
      type: 'degradation',
      message: `${featureId} feature has been temporarily degraded for demonstration purposes.`,
      feature: featureId
    });
    
    // Auto-clear message after duration
    setTimeout(() => {
      setSimulatedError(null);
    }, duration);
  };
  
  // Simulate network error
  const simulateNetworkError = (errorType: string) => {
    switch (errorType) {
      case 'offline':
        systemStatusService.updateStatus({ networkConnected: false });
        break;
      case 'server-down':
        systemStatusService.updateStatus({ serverAvailable: false });
        break;
      case 'timeout':
        // Just show an error message for timeout
        setSimulatedError({
          type: 'network',
          message: 'Network request timed out. Please try again later.',
          error: createError(
            ErrorType.NETWORK,
            'error',
            'Network request timed out',
            'The server took too long to respond',
            'TIMEOUT'
          )
        });
        break;
      case 'intermittent':
        // Simulate intermittent connectivity
        const toggleConnection = (isConnected: boolean, count: number) => {
          if (count <= 0) {
            systemStatusService.updateStatus({ networkConnected: true });
            return;
          }
          
          systemStatusService.updateStatus({ networkConnected: isConnected });
          
          setTimeout(() => {
            toggleConnection(!isConnected, count - 1);
          }, 3000);
        };
        
        toggleConnection(false, 4); // Toggle 4 times (off-on-off-on)
        break;
    }
    
    setDialogOpen(false);
    
    if (onErrorSimulated) {
      onErrorSimulated(`network:${errorType}`);
    }
  };
  
  // Simulate validation error
  const simulateValidationError = (fieldName: string) => {
    const validationErrors: Record<string, any> = {
      'subject': createValidationError(
        'Subject must be between 5 and 100 characters',
        'subject'
      ),
      'description': createValidationError(
        'Description must contain at least 20 characters',
        'description'
      ),
      'attachments': createValidationError(
        'File size exceeds maximum allowed (10MB)',
        'attachments'
      ),
      'form': {
        subject: 'Subject is required',
        description: 'Description is required',
        attachments: 'Maximum 5 attachments allowed'
      }
    };
    
    setDialogOpen(false);
    setSimulatedError({
      type: 'validation',
      message: `Validation error simulated for ${fieldName}`,
      error: validationErrors[fieldName]
    });
    
    if (onErrorSimulated) {
      onErrorSimulated(`validation:${fieldName}`);
    }
    
    // Auto-clear message after 10 seconds
    setTimeout(() => {
      setSimulatedError(null);
    }, 10000);
  };
  
  // Simulate server error
  const simulateServerError = (errorType: string) => {
    const serverErrors: Record<string, any> = {
      '500': createError(
        ErrorType.SERVER,
        'error',
        'Internal Server Error',
        'The server encountered an unexpected condition that prevented it from fulfilling the request',
        'SERVER_ERROR'
      ),
      '404': createError(
        ErrorType.CLIENT,
        'warning',
        'Resource Not Found',
        'The requested resource could not be found on the server',
        'NOT_FOUND'
      ),
      '403': createError(
        ErrorType.AUTHORIZATION,
        'error',
        'Access Denied',
        'You do not have permission to access this resource',
        'FORBIDDEN'
      ),
      '401': createError(
        ErrorType.AUTHENTICATION,
        'error',
        'Authentication Failed',
        'Your session may have expired. Please log in again.',
        'UNAUTHORIZED'
      )
    };
    
    setDialogOpen(false);
    setSimulatedError({
      type: 'server',
      message: `Server error ${errorType} simulated`,
      error: serverErrors[errorType]
    });
    
    if (onErrorSimulated) {
      onErrorSimulated(`server:${errorType}`);
    }
    
    // Auto-clear message after 10 seconds
    setTimeout(() => {
      setSimulatedError(null);
    }, 10000);
  };
  
  // Reset all simulated errors
  const resetAllErrors = () => {
    systemStatusService.updateStatus({
      networkConnected: true,
      serverAvailable: true,
      features: {
        ticketSubmission: true,
        ticketClassification: true,
        threadDecomposition: true,
        engineerAssignment: true,
        fileUpload: true,
        realTimeUpdates: true
      }
    });
    
    setSimulatedError(null);
    setDialogOpen(false);
    
    if (onErrorSimulated) {
      onErrorSimulated('reset');
    }
  };
  
  // Render error category content
  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'system':
        return (
          <List className="error-simulation-list">
            <li className="ui5-list-item" onClick={() => simulateDegradation('ticketSubmission')}>
              <span className="ui5-list-item-title">Ticket Submission Unavailable</span>
              <span className="ui5-list-item-description">Simulate ticket submission feature being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateDegradation('ticketClassification')}>
              <span className="ui5-list-item-title">AI Classification Unavailable</span>
              <span className="ui5-list-item-description">Simulate AI classification feature being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateDegradation('threadDecomposition')}>
              <span className="ui5-list-item-title">Thread Decomposition Unavailable</span>
              <span className="ui5-list-item-description">Simulate thread decomposition feature being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateDegradation('engineerAssignment')}>
              <span className="ui5-list-item-title">Engineer Assignment Unavailable</span>
              <span className="ui5-list-item-description">Simulate engineer assignment feature being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateDegradation('fileUpload')}>
              <span className="ui5-list-item-title">File Upload Unavailable</span>
              <span className="ui5-list-item-description">Simulate file upload feature being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateDegradation('realTimeUpdates')}>
              <span className="ui5-list-item-title">Real-time Updates Unavailable</span>
              <span className="ui5-list-item-description">Simulate real-time updates being unavailable</span>
            </li>
          </List>
        );
        
      case 'network':
        return (
          <List className="error-simulation-list">
            <li className="ui5-list-item" onClick={() => simulateNetworkError('offline')}>
              <span className="ui5-list-item-title">Network Offline</span>
              <span className="ui5-list-item-description">Simulate complete network disconnection</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateNetworkError('server-down')}>
              <span className="ui5-list-item-title">Server Unavailable</span>
              <span className="ui5-list-item-description">Simulate server being unavailable</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateNetworkError('timeout')}>
              <span className="ui5-list-item-title">Request Timeout</span>
              <span className="ui5-list-item-description">Simulate network request timeout</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateNetworkError('intermittent')}>
              <span className="ui5-list-item-title">Intermittent Connectivity</span>
              <span className="ui5-list-item-description">Simulate intermittent network connectivity</span>
            </li>
          </List>
        );
        
      case 'validation':
        return (
          <List className="error-simulation-list">
            <li className="ui5-list-item" onClick={() => simulateValidationError('subject')}>
              <span className="ui5-list-item-title">Subject Validation Error</span>
              <span className="ui5-list-item-description">Simulate subject field validation error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateValidationError('description')}>
              <span className="ui5-list-item-title">Description Validation Error</span>
              <span className="ui5-list-item-description">Simulate description field validation error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateValidationError('attachments')}>
              <span className="ui5-list-item-title">Attachment Validation Error</span>
              <span className="ui5-list-item-description">Simulate attachment validation error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateValidationError('form')}>
              <span className="ui5-list-item-title">Multiple Validation Errors</span>
              <span className="ui5-list-item-description">Simulate multiple form validation errors</span>
            </li>
          </List>
        );
        
      case 'server':
        return (
          <List className="error-simulation-list">
            <li className="ui5-list-item" onClick={() => simulateServerError('500')}>
              <span className="ui5-list-item-title">500 Internal Server Error</span>
              <span className="ui5-list-item-description">Simulate 500 Internal Server Error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateServerError('404')}>
              <span className="ui5-list-item-title">404 Not Found Error</span>
              <span className="ui5-list-item-description">Simulate 404 Not Found Error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateServerError('403')}>
              <span className="ui5-list-item-title">403 Forbidden Error</span>
              <span className="ui5-list-item-description">Simulate 403 Forbidden Error</span>
            </li>
            
            <li className="ui5-list-item" onClick={() => simulateServerError('401')}>
              <span className="ui5-list-item-title">401 Unauthorized Error</span>
              <span className="ui5-list-item-description">Simulate 401 Unauthorized Error</span>
            </li>
          </List>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="error-simulator">
      <Button
        icon="error"
        onClick={() => setDialogOpen(true)}
        tooltip="Simulate Errors"
        className="error-simulator-button"
      >
        Simulate Error
      </Button>
      
      {simulatedError && (
        <div className="simulated-error-container">
          {simulatedError.type === 'validation' && simulatedError.error && !simulatedError.error.field ? (
            <div className="validation-errors">
              {Object.entries(simulatedError.error).map(([field, message]) => (
                <FeedbackMessage
                  key={field}
                  message={`${field}: ${message}`}
                  type="warning"
                  onClose={() => setSimulatedError(null)}
                />
              ))}
            </div>
          ) : (
            <FeedbackMessage
              message={simulatedError.message}
              type={simulatedError.type === 'degradation' ? 'warning' : 'error'}
              onClose={() => setSimulatedError(null)}
            />
          )}
        </div>
      )}
      
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        header={
          <Bar design="Header">
            <Title>Simulate Errors</Title>
          </Bar>
        }
        footer={
          <Bar design="Footer" endContent={
            <FlexBox direction={FlexBoxDirection.Row} justifyContent={FlexBoxJustifyContent.End}>
              <Button design="Negative" onClick={resetAllErrors}>
                Reset All Errors
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </FlexBox>
          } />
        }
        className="error-simulator-dialog"
      >
        <div className="error-simulator-content">
          <Label>Select error category:</Label>
          <Select
            className="category-selector"
            onChange={(e) => setSelectedCategory(e.detail.selectedOption.getAttribute('data-id') || 'system')}
          >
            {errorCategories.map(category => (
              <Option key={category.id} data-id={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          
          <div className="error-options">
            {renderCategoryContent()}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ErrorSimulator;