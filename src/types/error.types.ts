export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const ErrorMessages = {
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCodes.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.FORBIDDEN]: 'Access denied.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.CONFLICT]: 'A conflict occurred. Please try again.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred.',
};