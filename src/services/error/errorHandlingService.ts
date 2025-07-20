import { announceToScreenReader } from '../../utils/accessibilityUtils';

/**
 * Error types for the application
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

/**
 * Application error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  code?: string;
  details?: string;
  timestamp: Date;
  handled: boolean;
}

/**
 * Error handling service for the application
 */
class ErrorHandlingService {
  private errors: AppError[] = [];
  private errorListeners: ((error: AppError) => void)[] = [];
  
  /**
   * Handle an error and return an AppError object
   */
  public handleError(
    error: Error | string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: string
  ): AppError {
    const message = typeof error === 'string' ? error : error.message;
    
    const appError: AppError = {
      type,
      message,
      severity,
      code,
      details,
      timestamp: new Date(),
      handled: false
    };
    
    this.errors.push(appError);
    
    // Notify listeners
    this.notifyListeners(appError);
    
    // Announce critical errors to screen readers
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      announceToScreenReader(`Error: ${message}`, 'assertive');
    }
    
    // Log error to console
    this.logError(appError);
    
    return appError;
  }
  
  /**
   * Handle network errors
   */
  public handleNetworkError(error: Error | string, details?: string): AppError {
    return this.handleError(
      error,
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      'NET_ERR',
      details
    );
  }
  
  /**
   * Handle authentication errors
   */
  public handleAuthError(error: Error | string, details?: string): AppError {
    return this.handleError(
      error,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      'AUTH_ERR',
      details
    );
  }
  
  /**
   * Handle validation errors
   */
  public handleValidationError(error: Error | string, details?: string): AppError {
    return this.handleError(
      error,
      ErrorType.VALIDATION,
      ErrorSeverity.MEDIUM,
      'VAL_ERR',
      details
    );
  }
  
  /**
   * Handle server errors
   */
  public handleServerError(error: Error | string, details?: string): AppError {
    return this.handleError(
      error,
      ErrorType.SERVER,
      ErrorSeverity.HIGH,
      'SRV_ERR',
      details
    );
  }
  
  /**
   * Mark an error as handled
   */
  public markAsHandled(error: AppError): void {
    const index = this.errors.findIndex(e => e === error);
    if (index !== -1) {
      this.errors[index].handled = true;
    }
  }
  
  /**
   * Get all errors
   */
  public getErrors(): AppError[] {
    return [...this.errors];
  }
  
  /**
   * Get unhandled errors
   */
  public getUnhandledErrors(): AppError[] {
    return this.errors.filter(error => !error.handled);
  }
  
  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Add an error listener
   */
  public addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }
  
  /**
   * Remove an error listener
   */
  public removeErrorListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index !== -1) {
      this.errorListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of a new error
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
  
  /**
   * Log error to console with appropriate formatting
   */
  private logError(error: AppError): void {
    const timestamp = error.timestamp.toISOString();
    const prefix = `[${timestamp}] [${error.type}] [${error.severity}]`;
    
    console.error(`${prefix} ${error.message}`);
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    if (error.details) {
      console.error(`Details: ${error.details}`);
    }
  }
}

export const errorHandlingService = new ErrorHandlingService();