// frontend/src/hooks/useApi.ts

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  setLoading,
  setError,
  clearError as clearApiError,
  addRequest,
  removeRequest,
  selectIsLoading,
  selectError,
  selectActiveRequests,
  selectIsRequestActive,
} from '@/store/slices/apiSlice';

interface ApiCallOptions<T> {
  requestId?: string;
  skipLoading?: boolean;
  skipError?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing API calls with loading and error states
 * Provides a wrapper around API calls with automatic state management
 * 
 * @example
 * const { callApi, loading, error } = useApi();
 * 
 * const fetchData = async () => {
 *   const data = await callApi(() => apiService.getData(), {
 *     requestId: 'fetch-data',
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error),
 *   });
 * };
 */
export const useApi = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const activeRequests = useAppSelector(selectActiveRequests);

  // Check if a specific request is active
  const isRequestActive = useCallback(
    (requestId: string): boolean => {
      return useAppSelector(state => selectIsRequestActive(state, requestId));
    },
    []
  );

  // Clear error state
  const clearError = useCallback(() => {
    dispatch(clearApiError());
  }, [dispatch]);

  // Set custom error
  const setApiError = useCallback((errorMessage: string) => {
    dispatch(setError(errorMessage));
  }, [dispatch]);

  // Main API call wrapper
  const callApi = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      options: ApiCallOptions<T> = {}
    ): Promise<T> => {
      const {
        requestId = `api-call-${Date.now()}`,
        skipLoading = false,
        skipError = false,
        onSuccess,
        onError,
      } = options;

      try {
        // Add request to tracking (sets loading if not skipped)
        if (!skipLoading) {
          dispatch(addRequest(requestId));
        }

        // Execute the API call
        const result = await apiCall();

        // Call success handler if provided
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const err = error as Error;
        
        // Set error state if not skipped
        if (!skipError) {
          dispatch(setError(err.message || 'An error occurred'));
        }

        // Call error handler if provided
        if (onError) {
          onError(err);
        } else {
          // Re-throw if no error handler provided
          throw err;
        }

        // Return undefined for TypeScript (never reached due to throw)
        return undefined as any;
      } finally {
        // Remove request from tracking
        if (!skipLoading) {
          dispatch(removeRequest(requestId));
        }
      }
    },
    [dispatch]
  );

  return {
    // State
    loading,
    error,
    activeRequests,

    // Methods
    callApi,
    clearError,
    setApiError,
    isRequestActive,
  };
};
