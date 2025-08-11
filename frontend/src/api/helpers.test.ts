// frontend/src/api/helpers.test.ts

import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosResponse } from 'axios';
import {
  handleApiError,
  createApiResponse,
  buildQueryString,
  isApiError,
  extractErrorMessage,
  retryRequest,
} from './helpers';
import { ApiError } from '@/types';

describe('API Helpers', () => {
  describe('handleApiError', () => {
    it('should extract message from API error response', () => {
      const error: AxiosError<ApiError> = {
        response: {
          data: {
            message: 'Custom error message',
            timestamp: '2025-01-15T10:00:00Z',
            path: '/api/test',
            status: 400,
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed',
      };

      const result = handleApiError(error);
      expect(result.message).toBe('Custom error message');
      expect(result.status).toBe(400);
      expect(result.details).toEqual(error.response?.data);
    });

    it('should handle network errors', () => {
      const error: AxiosError = {
        message: 'Network Error',
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
      };

      const result = handleApiError(error);
      expect(result.message).toBe('Network error. Please check your connection.');
      expect(result.status).toBe(0);
    });

    it('should handle non-Axios errors', () => {
      const error = new Error('Regular error');
      
      const result = handleApiError(error);
      expect(result.message).toBe('Regular error');
      expect(result.status).toBeUndefined();
    });
  });

  describe('createApiResponse', () => {
    it('should create standardized success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createApiResponse(data, 'Operation successful');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Operation successful');
      expect(response.timestamp).toBeDefined();
    });

    it('should create error response', () => {
      const error = { message: 'Operation failed' };
      const response = createApiResponse(null, 'Error occurred', error);

      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Error occurred');
      expect(response.error).toEqual(error);
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from params object', () => {
      const params = {
        page: 1,
        size: 10,
        sort: 'name,asc',
        filter: 'active',
      };

      const queryString = buildQueryString(params);
      expect(queryString).toBe('?page=1&size=10&sort=name%2Casc&filter=active');
    });

    it('should handle empty params', () => {
      const queryString = buildQueryString({});
      expect(queryString).toBe('');
    });

    it('should filter out null and undefined values', () => {
      const params = {
        page: 1,
        size: null,
        sort: undefined,
        filter: 'active',
      };

      const queryString = buildQueryString(params);
      expect(queryString).toBe('?page=1&filter=active');
    });

    it('should handle array values', () => {
      const params = {
        ids: [1, 2, 3],
        tags: ['tech', 'finance'],
      };

      const queryString = buildQueryString(params);
      expect(queryString).toContain('ids=1');
      expect(queryString).toContain('ids=2');
      expect(queryString).toContain('ids=3');
      expect(queryString).toContain('tags=tech');
      expect(queryString).toContain('tags=finance');
    });
  });

  describe('isApiError', () => {
    it('should identify API error structure', () => {
      const apiError: ApiError = {
        message: 'Error',
        timestamp: '2025-01-15T10:00:00Z',
        path: '/api/test',
        status: 400,
      };

      expect(isApiError(apiError)).toBe(true);
    });

    it('should reject non-API error structures', () => {
      const notApiError = {
        error: 'Something went wrong',
      };

      expect(isApiError(notApiError)).toBe(false);
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from various error formats', () => {
      // API Error format
      const apiError = {
        response: {
          data: {
            message: 'API error message',
          },
        },
      };
      expect(extractErrorMessage(apiError)).toBe('API error message');

      // Error with message property
      const standardError = new Error('Standard error message');
      expect(extractErrorMessage(standardError)).toBe('Standard error message');

      // String error
      expect(extractErrorMessage('String error')).toBe('String error');

      // Unknown error
      expect(extractErrorMessage({})).toBe('An unknown error occurred');
    });
  });

  describe('retryRequest', () => {
    it('should retry failed request with exponential backoff', async () => {
      const mockRequest = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce({ data: 'Success' });

      const result = await retryRequest(mockRequest, 3, 100);
      
      expect(result).toEqual({ data: 'Success' });
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockRequest = vi.fn()
        .mockRejectedValue(new Error('Always fails'));

      await expect(retryRequest(mockRequest, 3, 100)).rejects.toThrow('Always fails');
      expect(mockRequest).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx errors', async () => {
      const error: AxiosError = {
        response: {
          status: 400,
          data: {},
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Bad Request',
      };

      const mockRequest = vi.fn().mockRejectedValue(error);

      await expect(retryRequest(mockRequest, 3, 100)).rejects.toThrow();
      expect(mockRequest).toHaveBeenCalledTimes(1); // Should not retry
    });
  });
});
