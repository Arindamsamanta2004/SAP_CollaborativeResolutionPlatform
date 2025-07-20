import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  MessageStrip,

  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Title,
  Icon
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/error.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import './styles.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary">
          <MessageStrip
            design="Negative"
            hideCloseButton={false}
            onClose={this.handleReset}
            className="error-message-strip"
          >
            <FlexBox
              direction={FlexBoxDirection.Column}
              justifyContent={FlexBoxJustifyContent.Center}
              alignItems={FlexBoxAlignItems.Center}
              className="error-content"
            >
              <Icon name="error" className="error-icon" />
              
              <Title level="H4" className="error-title">
                {this.props.componentName 
                  ? `Error in ${this.props.componentName}`
                  : 'Something went wrong'}
              </Title>
              
              <p className="error-description">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              <Button
                icon="refresh"
                onClick={this.handleReset}
                className="reset-button"
              >
                Try Again
              </Button>
            </FlexBox>
          </MessageStrip>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;