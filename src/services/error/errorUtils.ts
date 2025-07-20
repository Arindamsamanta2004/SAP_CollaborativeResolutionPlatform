import { ErrorType, ErrorSeverity } from './errorHandlingService';

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  handled: boolean;
}

export const createError = (
  type: ErrorType,
  severity: 'error' | 'warning',
  message: string,
  details?: string,
  code?: string
): AppError => {
  return {
    type,
    severity: severity === 'error' ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    message,
    details,
    code,
    timestamp: new Date(),
    handled: false
  };
};

export const createValidationError = (
  message: string,
  field: string
): any => {
  return {
    message,
    field
  };
};

export const networkErrorHandling = {
  createRetryStrategy: (maxRetries: number, delay: number) => {
    return {
      maxRetries,
      delay,
      execute: async (fn: () => Promise<any>, onRetry?: (attempt: number, error: any) => void) => {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            if (onRetry) {
              onRetry(attempt, error);
            }
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        throw lastError;
      }
    };
  }
};

export const formValidation = {
  validateRequired: (value: string, fieldName: string) => {
    if (!value || value.trim() === '') {
      return createValidationError(`${fieldName} is required`, fieldName.toLowerCase());
    }
    return null;
  },
  
  validateLength: (value: string, min: number, max: number, fieldName: string) => {
    if (value.length < min || value.length > max) {
      return createValidationError(
        `${fieldName} must be between ${min} and ${max} characters`,
        fieldName.toLowerCase()
      );
    }
    return null;
  }
};