// frontend/src/hooks/useApi.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useApi } from './useApi';
import apiReducer from '@/store/slices/apiSlice';

describe('useApi', () => {
  // Helper to create test store
  const createTestStore = () => {
    return configureStore({
      reducer: {
        api: apiReducer,
      },
    });
  };

  // Helper to create wrapper with store
  const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Access', () => {
    it('should provide api state', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useApi(), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.activeRequests).toEqual([]);
    });
  });

  describe('callApi', () => {
    it('should execute api call successfully', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.callApi(mockApiCall);
      });

      expect(mockApiCall).toHaveBeenCalled();
      expect(response).toEqual({ data: 'test' });
    });

    it('should handle api call with arguments', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        await result.current.callApi(() => mockApiCall('arg1', 'arg2'));
      });

      expect(mockApiCall).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should track loading state during api call', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      let resolvePromise: (value: any) => void;
      const mockApiCall = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );
      
      const { result } = renderHook(() => useApi(), { wrapper });

      // Start the API call
      let apiPromise: Promise<any>;
      act(() => {
        apiPromise = result.current.callApi(mockApiCall);
      });

      // Check loading state is true
      expect(result.current.loading).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ data: 'test' });
        await apiPromise;
      });

      // Check loading state is false
      expect(result.current.loading).toBe(false);
    });

    it('should handle api call errors', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockError = new Error('API Error');
      const mockApiCall = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        try {
          await result.current.callApi(mockApiCall);
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.loading).toBe(false);
    });

    it('should handle api call with custom error handler', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockError = new Error('API Error');
      const mockApiCall = jest.fn().mockRejectedValue(mockError);
      const mockErrorHandler = jest.fn();
      
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        await result.current.callApi(mockApiCall, {
          onError: mockErrorHandler,
        });
      });

      expect(mockErrorHandler).toHaveBeenCalledWith(mockError);
    });

    it('should handle api call with success handler', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockData = { data: 'test' };
      const mockApiCall = jest.fn().mockResolvedValue(mockData);
      const mockSuccessHandler = jest.fn();
      
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        await result.current.callApi(mockApiCall, {
          onSuccess: mockSuccessHandler,
        });
      });

      expect(mockSuccessHandler).toHaveBeenCalledWith(mockData);
    });
  });

  describe('Request Tracking', () => {
    it('should track request with custom id', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      let resolvePromise: (value: any) => void;
      const mockApiCall = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );
      
      const { result } = renderHook(() => useApi(), { wrapper });

      // Start the API call with request ID
      let apiPromise: Promise<any>;
      act(() => {
        apiPromise = result.current.callApi(mockApiCall, {
          requestId: 'test-request',
        });
      });

      // Check request is being tracked
      expect(result.current.isRequestActive('test-request')).toBe(true);
      expect(result.current.activeRequests).toContain('test-request');

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ data: 'test' });
        await apiPromise;
      });

      // Check request is no longer tracked
      expect(result.current.isRequestActive('test-request')).toBe(false);
      expect(result.current.activeRequests).not.toContain('test-request');
    });

    it('should generate unique request id if not provided', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        await result.current.callApi(mockApiCall);
      });

      // Should have generated a request ID (activeRequests should be empty after completion)
      expect(result.current.activeRequests).toEqual([]);
    });
  });

  describe('Error Management', () => {
    it('should clear error', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const { result } = renderHook(() => useApi(), { wrapper });

      // Set an error first
      act(() => {
        result.current.setApiError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should set custom error', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const { result } = renderHook(() => useApi(), { wrapper });

      act(() => {
        result.current.setApiError('Custom error message');
      });

      expect(result.current.error).toBe('Custom error message');
    });
  });

  describe('Multiple Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      let resolvePromise1: (value: any) => void;
      let resolvePromise2: (value: any) => void;
      
      const mockApiCall1 = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolvePromise1 = resolve; })
      );
      const mockApiCall2 = jest.fn().mockImplementation(() => 
        new Promise(resolve => { resolvePromise2 = resolve; })
      );
      
      const { result } = renderHook(() => useApi(), { wrapper });

      // Start two API calls
      let apiPromise1: Promise<any>;
      let apiPromise2: Promise<any>;
      
      act(() => {
        apiPromise1 = result.current.callApi(mockApiCall1, { requestId: 'req-1' });
        apiPromise2 = result.current.callApi(mockApiCall2, { requestId: 'req-2' });
      });

      // Both requests should be active
      expect(result.current.activeRequests).toHaveLength(2);
      expect(result.current.isRequestActive('req-1')).toBe(true);
      expect(result.current.isRequestActive('req-2')).toBe(true);
      expect(result.current.loading).toBe(true);

      // Resolve first request
      await act(async () => {
        resolvePromise1!({ data: 'test1' });
        await apiPromise1;
      });

      // First request done, second still active
      expect(result.current.isRequestActive('req-1')).toBe(false);
      expect(result.current.isRequestActive('req-2')).toBe(true);
      expect(result.current.loading).toBe(true);

      // Resolve second request
      await act(async () => {
        resolvePromise2!({ data: 'test2' });
        await apiPromise2;
      });

      // Both requests done
      expect(result.current.activeRequests).toHaveLength(0);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Options', () => {
    it('should skip loading state when specified', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        await result.current.callApi(mockApiCall, {
          skipLoading: true,
        });
      });

      // Loading state should never have been set
      expect(result.current.loading).toBe(false);
    });

    it('should not set error state when skipError is true', async () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);
      
      const mockError = new Error('API Error');
      const mockApiCall = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useApi(), { wrapper });

      await act(async () => {
        try {
          await result.current.callApi(mockApiCall, {
            skipError: true,
          });
        } catch (error) {
          // Error is still thrown
          expect(error).toBe(mockError);
        }
      });

      // Error state should not be set
      expect(result.current.error).toBeNull();
    });
  });
});
