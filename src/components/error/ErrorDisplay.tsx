import React from 'react';
import { Alert, Button } from 'antd';
import { RefreshCw } from 'lucide-react';
import { ErrorResponse, ErrorCodes, ErrorMessages } from '../../types/error.types';

interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '' 
}) => {
  const getErrorType = (code: string) => {
    switch (code) {
      case ErrorCodes.VALIDATION_ERROR:
        return 'warning';
      case ErrorCodes.NETWORK_ERROR:
      case ErrorCodes.SERVER_ERROR:
        return 'error';
      case ErrorCodes.UNAUTHORIZED:
      case ErrorCodes.FORBIDDEN:
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <Alert
        type={getErrorType(error.code)}
        showIcon
        message={error.message || ErrorMessages[error.code as ErrorCodes]}
        action={
          onRetry && (
            <Button
              size="small"
              icon={<RefreshCw size={14} />}
              onClick={onRetry}
              className="flex items-center gap-1"
            >
              Retry
            </Button>
          )
        }
        className="mb-4"
      />
    </div>
  );
};