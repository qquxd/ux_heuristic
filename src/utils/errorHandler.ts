import { ValidationError, ErrorResponse, ErrorCodes } from '../types/error.types';

export class ErrorHandler {
  static parseValidationErrors(errorDetails: Record<string, string[]>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    Object.entries(errorDetails).forEach(([field, messages]) => {
      messages.forEach((message) => {
        errors.push({
          field: this.formatFieldName(field),
          message,
        });
      });
    });
    
    return errors;
  }

  static formatFieldName(field: string): string {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
    const error = errors.find(err => err.field.toLowerCase().replace(' ', '_') === fieldName);
    return error?.message;
  }
}