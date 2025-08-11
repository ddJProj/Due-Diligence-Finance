// frontend/src/api/apiClient.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// Create axios instance with default configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management functions
export const setAuthToken = (token: string): void => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('authToken', token);
};

export const clearAuthToken = (): void => {
  delete apiClient.defaults.headers.common['Authorization'];
  localStorage.removeItem('authToken');
};

// Initialize token from localStorage
const initializeAuth = (): void => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
  }
};

// Request interceptor
const setupRequestInterceptor = (): void => {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add timestamp header for request tracking
      config.headers['X-Request-Timestamp'] = new Date().toISOString();
      
      // Log request in development
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      
      return config;
    },
    (error) => {
      // Log request error
      if (import.meta.env.DEV) {
        console.error('[API Request Error]', error);
      }
      return Promise.reject(error);
    }
  );
};

// Response interceptor
const setupResponseInterceptor = (): void => {
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      // Log error in development
      if (import.meta.env.DEV) {
        console.error('[API Response Error]', error);
      }

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        clearAuthToken();
        // In a real app, we might redirect to login or trigger a refresh token flow
        // For now, we'll just clear the token
      }

      // Transform error messages for better UX
      if (error.response) {
        const status = error.response.status;
        let message = error.response.data?.message || error.response.data?.error || '';

        // Provide user-friendly messages for common HTTP errors
        switch (status) {
          case 400:
            message = message || 'Invalid request. Please check your input.';
            break;
          case 403:
            message = message || 'You do not have permission to perform this action.';
            break;
          case 404:
            message = message || 'The requested resource was not found.';
            break;
          case 409:
            message = message || 'This operation conflicts with existing data.';
            break;
          case 422:
            message = message || 'The provided data is invalid.';
            break;
          case 500:
            message = message || 'An unexpected error occurred. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            message = message || 'The service is temporarily unavailable. Please try again later.';
            break;
          default:
            message = message || `An error occurred (${status})`;
        }

        // Enhance error response
        error.response.data = {
          ...error.response.data,
          message,
          timestamp: new Date().toISOString(),
          path: error.config?.url,
          status,
        };
      } else if (error.request) {
        // Network error - no response received
        error.response = {
          data: {
            message: 'Network error. Please check your connection.',
            timestamp: new Date().toISOString(),
            path: error.config?.url,
            status: 0,
          },
          status: 0,
          statusText: 'Network Error',
          headers: {},
          config: error.config!,
        } as AxiosResponse<ApiError>;
      }

      return Promise.reject(error);
    }
  );
};

// Setup all interceptors
export const setupInterceptors = (): void => {
  setupRequestInterceptor();
  setupResponseInterceptor();
};

// Initialize on module load
initializeAuth();
setupInterceptors();

// Export configured instance as default
export default apiClient;
