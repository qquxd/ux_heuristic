import { apiService } from '../config/api.config';
import { ErrorResponse, ErrorCodes } from '../types/error.types';

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  password2: string;
  organisation: string;
  plan?: number;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    name: string;
    organisation: string;
    plan: number;
    status: string;
    created_on: string;
    updated_on: string;
  };
  refresh: string;
  access: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: {
    id: number;
    email: string;
    name: string;
    organisation: string;
    plan: number;
    status: string;
    created_on: string;
    updated_on: string;
  };
}

export class AuthService {
  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const payload = {
        ...data,
        plan: 1, // Default plan value
      };

      const response = await apiService.post<RegisterResponse>('/auth/register/', payload);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Registration failed',
      };

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorResponse.code = ErrorCodes.VALIDATION_ERROR;
            errorResponse.message = 'Invalid registration data';
            errorResponse.details = error.response.data;
            break;
          case 409:
            errorResponse.code = ErrorCodes.CONFLICT;
            errorResponse.message = 'User already exists';
            break;
          case 500:
            errorResponse.code = ErrorCodes.SERVER_ERROR;
            errorResponse.message = 'Server error occurred';
            break;
        }
      } else if (error.request) {
        errorResponse.code = ErrorCodes.NETWORK_ERROR;
        errorResponse.message = 'Network error. Please check your connection.';
      }

      throw errorResponse;
    }
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login/', data);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Login failed',
      };

      if (error.response) {
        switch (error.response.status) {
          case 400:
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'Invalid email or password';
            break;
          case 500:
            errorResponse.code = ErrorCodes.SERVER_ERROR;
            errorResponse.message = 'Server error occurred';
            break;
        }
      } else if (error.request) {
        errorResponse.code = ErrorCodes.NETWORK_ERROR;
        errorResponse.message = 'Network error. Please check your connection.';
      }

      throw errorResponse;
    }
  }
}