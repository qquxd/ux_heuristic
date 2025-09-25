import { apiService } from '../config/api.config';
import { ErrorResponse, ErrorCodes } from '../types/error.types';
import { PageRoute, FindPagesResponse, AvailableRoutesResponse } from '../types/project.types';

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
  created_on?: string;
}

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface CreateProjectRequest {
  project_name: string;
  description: string;
  project_type: string;
  status: string;
  project_goal: {
    goal: string;
  };
  website_url: string;
}

export class ProjectService {
  static async getProjects(): Promise<ProjectsResponse> {
    try {
      const response = await apiService.authGet<ProjectsResponse>('/projects/');
      
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
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

  static async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const response = await apiService.authPost<Project>('/projects/', data);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to create project',
      };

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorResponse.code = ErrorCodes.VALIDATION_ERROR;
            errorResponse.message = 'Invalid project data';
            errorResponse.details = error.response.data;
            break;
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized to create projects';
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

  static async getAvailableRoutes(projectId: number): Promise<AvailableRoutesResponse> {
    try {
      const response = await apiService.authGet<AvailableRoutesResponse>(`/projects/${projectId}/available-routes/`);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to fetch available routes',
      };

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized to view project routes';
            break;
          case 403:
            errorResponse.code = ErrorCodes.FORBIDDEN;
            errorResponse.message = 'Access denied';
            break;
          case 404:
            errorResponse.code = ErrorCodes.NOT_FOUND;
            errorResponse.message = 'Project not found';
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

  static async analyzePages(projectId: number, pageIds: number[]): Promise<any> {
    try {
      const response = await apiService.authPost(`/projects/${projectId}/pages/bulk-action/`, {
        page_analysis_ids: pageIds
      });
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to analyze pages',
      };

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorResponse.code = ErrorCodes.VALIDATION_ERROR;
            errorResponse.message = 'Invalid page analysis data';
            errorResponse.details = error.response.data;
            break;
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized to analyze pages';
            break;
          case 403:
            errorResponse.code = ErrorCodes.FORBIDDEN;
            errorResponse.message = 'Access denied';
            break;
          case 404:
            errorResponse.code = ErrorCodes.NOT_FOUND;
            errorResponse.message = 'Project not found';
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
  static async findPages(projectId: number): Promise<FindPagesResponse> {
    try {
      const response = await apiService.authGetLongTimeout<FindPagesResponse>(`/projects/${projectId}/find-url/`);
      return response.data;
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'Failed to find pages',
      };

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorResponse.code = ErrorCodes.UNAUTHORIZED;
            errorResponse.message = 'You are not authorized to find pages';
            break;
          case 403:
            errorResponse.code = ErrorCodes.FORBIDDEN;
            errorResponse.message = 'Access denied';
            break;
          case 404:
            errorResponse.code = ErrorCodes.NOT_FOUND;
            errorResponse.message = 'Project not found';
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