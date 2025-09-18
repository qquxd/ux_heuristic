import { apiService } from '../config/api.config';
import { ErrorResponse, ErrorCodes } from '../types/error.types';

export interface Project {
  id: number;
  project_name: string;
  description: string;
  project_type: string;
  status: string;
  project_goal: {
    goal: string;
  };
  website_url: string;
}

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export class ProjectService {
  static async getProjects(): Promise<ProjectsResponse> {
    try {
      const response = await apiService.authGet<ProjectsResponse>('/projects/');
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to fetch projects',
      };

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized to view projects';
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