// frontend/src/api/helpers.ts

import { AxiosError } from 'axios';
import { ApiError } from '@/types';

/**
 * Standardized API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: any;
  timestamp: string;
}

/**
 * Handle API errors and extract meaningful information
 */
export function handleApiError(error: unknown): {
  message: string;
  status?: number;
  details?: any;
} {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Network error - no response
    if (!axiosError.response) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
    
    // API error with response
    return {
      message: axiosError.response.data?.message || axiosError.message,
      status: axiosError.response.status,
      details: axiosError.response.data,
    };
  }
  
  // Regular Error
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  // Unknown error
  return {
    message: 'An unknown error occurred',
  };
}

/**
 * Create standardized API response
 */
export function createApiResponse<T>(
  data: T | null,
  message?: string,
  error?: any
): ApiResponse<T> {
  return {
    success: !error,
    data,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }
    
    if (Array.isArray(value)) {
      // Handle array values
      value.forEach((item) => {
        queryParams.append(key, String(item));
      });
    } else {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Type guard to check if an object is an ApiError
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'timestamp' in error &&
    'path' in error &&
    'status' in error
  );
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
  // Try API error format first
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  
  // Try standard Error
  if (error instanceof Error) {
    return error.message;
  }
  
  // Try string
  if (typeof error === 'string') {
    return error;
  }
  
  // Default
  return 'An unknown error occurred';
}

/**
 * Retry a request with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (client errors)
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // If not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Format date for API requests (ISO 8601)
 */
export function formatDateForApi(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Parse date from API response
 */
export function parseDateFromApi(dateString: string): Date {
  return new Date(dateString);
}
