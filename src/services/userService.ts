import { apiService } from '../config/api.config';
import { ErrorResponse, ErrorCodes } from '../types/error.types';
import { User } from '../store/authStore';

export class UserService {
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.authGet<User>('/auth/user/');
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to fetch user data',
      };

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized';
            break;
          case 403:
            errorResponse.code = ErrorCodes.FORBIDDEN;
            errorResponse.message = 'Access denied';
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