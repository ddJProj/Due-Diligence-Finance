// frontend/src/api/apiClient.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient, setupInterceptors, clearAuthToken, setAuthToken } from './apiClient';

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Base Configuration', () => {
    it('should create axios instance with correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe('http://localhost:8080/api');
    });

    it('should have correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    });

    it('should have reasonable timeout', () => {
      expect(apiClient.defaults.timeout).toBe(30000); // 30 seconds
    });
  });

  describe('Auth Token Management', () => {
    it('should set auth token in headers and localStorage', () => {
      const token = 'test-jwt-token';
      setAuthToken(token);

      expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', token);
    });

    it('should clear auth token from headers and localStorage', () => {
      // First set a token
      setAuthToken('test-token');
      
      // Then clear it
      clearAuthToken();

      expect(apiClient.defaults.headers.common['Authorization']).toBeUndefined();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should restore token from localStorage on initialization', () => {
      const storedToken = 'stored-jwt-token';
      localStorageMock.getItem.mockReturnValue(storedToken);

      // Re-import to trigger initialization
      vi.resetModules();
      import('./apiClient').then(() => {
        expect(apiClient.defaults.headers.common['Authorization']).toBe(`Bearer ${storedToken}`);
      });
    });
  });

  describe('Request Interceptors', () => {
    it('should add timestamp to requests', async () => {
      const mockRequest: InternalAxiosRequestConfig = {
        headers: {} as any,
        url: '/test',
        method: 'get',
      };

      // Get the request interceptor
      const interceptor = apiClient.interceptors.request.handlers[0];
      if (interceptor && interceptor.fulfilled) {
        const result = await interceptor.fulfilled(mockRequest);
        expect(result.headers['X-Request-Timestamp']).toBeDefined();
        expect(new Date(result.headers['X-Request-Timestamp'])).toBeInstanceOf(Date);
      }
    });

    it('should handle request interceptor errors', async () => {
      const error = new Error('Request setup failed');
      
      const interceptor = apiClient.interceptors.request.handlers[0];
      if (interceptor && interceptor.rejected) {
        await expect(interceptor.rejected(error)).rejects.toThrow('Request setup failed');
      }
    });
  });

  describe('Response Interceptors', () => {
    it('should pass through successful responses', async () => {
      const mockResponse = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      if (interceptor && interceptor.fulfilled) {
        const result = await interceptor.fulfilled(mockResponse);
        expect(result).toBe(mockResponse);
      }
    });

    it('should handle 401 errors by clearing auth token', async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized',
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      if (interceptor && interceptor.rejected) {
        await expect(interceptor.rejected(error)).rejects.toThrow();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      }
    });

    it('should transform specific error codes to user-friendly messages', async () => {
      const testCases = [
        { status: 400, expectedMessage: 'Invalid request. Please check your input.' },
        { status: 403, expectedMessage: 'You do not have permission to perform this action.' },
        { status: 404, expectedMessage: 'The requested resource was not found.' },
        { status: 500, expectedMessage: 'An unexpected error occurred. Please try again later.' },
      ];

      for (const testCase of testCases) {
        const error: AxiosError = {
          response: {
            status: testCase.status,
            data: {},
            statusText: '',
            headers: {},
            config: {} as any,
          },
          config: {} as any,
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'AxiosError',
          message: '',
        };

        const interceptor = apiClient.interceptors.response.handlers[0];
        if (interceptor && interceptor.rejected) {
          try {
            await interceptor.rejected(error);
          } catch (err: any) {
            expect(err.response.data.message).toBe(testCase.expectedMessage);
          }
        }
      }
    });

    it('should handle network errors', async () => {
      const error: AxiosError = {
        message: 'Network Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      if (interceptor && interceptor.rejected) {
        try {
          await interceptor.rejected(error);
        } catch (err: any) {
          expect(err.response.data.message).toBe('Network error. Please check your connection.');
        }
      }
    });
  });

  describe('API Methods', () => {
    it('should have all standard HTTP methods available', () => {
      expect(typeof apiClient.get).toBe('function');
      expect(typeof apiClient.post).toBe('function');
      expect(typeof apiClient.put).toBe('function');
      expect(typeof apiClient.patch).toBe('function');
      expect(typeof apiClient.delete).toBe('function');
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variable for API URL if available', () => {
      // This would be set in .env file
      const envApiUrl = import.meta.env.VITE_API_URL;
      if (envApiUrl) {
        expect(apiClient.defaults.baseURL).toBe(envApiUrl);
      } else {
        expect(apiClient.defaults.baseURL).toBe('http://localhost:8080/api');
      }
    });
  });
});
