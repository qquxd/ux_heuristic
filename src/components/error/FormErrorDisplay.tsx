import React from 'react';
import { Alert } from 'antd';
import { ValidationError } from '../../types/error.types';

interface FormErrorDisplayProps {
  errors: ValidationError[];
  className?: string;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ 
  errors, 
  className = '' 
}) => {
  if (errors.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <Alert
        type="error"
        showIcon
        message="Please correct the following errors:"
        description={
          <ul className="list-disc list-inside mt-2">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{error.field}:</span> {error.message}
              </li>
            ))}
          </ul>
        }
        className="mb-4"
      />
    </div>
  );
};