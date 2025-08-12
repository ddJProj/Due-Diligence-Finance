// frontend/src/store/slices/apiSlice.test.ts

import { configureStore } from '@reduxjs/toolkit';
import apiReducer, {
  setLoading,
  setError,
  clearError,
  addRequest,
  removeRequest,
  clearAllRequests,
  selectApi,
  selectIsLoading,
  selectError,
  selectActiveRequests,
  selectIsRequestActive,
  ApiState,
} from './apiSlice';

describe('apiSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        api: apiReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().api;
      expect(state).toEqual({
        loading: false,
        error: null,
        activeRequests: [],
      });
    });
  });

  describe('Actions', () => {
    describe('setLoading', () => {
      it('should set loading state', () => {
        store.dispatch(setLoading(true));
        expect(store.getState().api.loading).toBe(true);

        store.dispatch(setLoading(false));
        expect(store.getState().api.loading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        const errorMessage = 'Network error occurred';
        store.dispatch(setError(errorMessage));
        
        const state = store.getState().api;
        expect(state.error).toBe(errorMessage);
        expect(state.loading).toBe(false); // Should clear loading on error
      });

      it('should handle null error', () => {
        store.dispatch(setError('Some error'));
        store.dispatch(setError(null));
        
        expect(store.getState().api.error).toBeNull();
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        store.dispatch(setError('Some error'));
        store.dispatch(clearError());
        
        expect(store.getState().api.error).toBeNull();
      });
    });

    describe('Request tracking', () => {
      it('should add request to active requests', () => {
        const requestId = 'fetch-users-123';
        store.dispatch(addRequest(requestId));
        
        const state = store.getState().api;
        expect(state.activeRequests).toContain(requestId);
        expect(state.loading).toBe(true); // Should set loading when requests active
      });

      it('should handle multiple requests', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(addRequest('request-2'));
        store.dispatch(addRequest('request-3'));
        
        const state = store.getState().api;
        expect(state.activeRequests).toHaveLength(3);
        expect(state.activeRequests).toEqual(['request-1', 'request-2', 'request-3']);
      });

      it('should not add duplicate requests', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(addRequest('request-1')); // Duplicate
        
        const state = store.getState().api;
        expect(state.activeRequests).toHaveLength(1);
        expect(state.activeRequests).toEqual(['request-1']);
      });

      it('should remove request from active requests', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(addRequest('request-2'));
        store.dispatch(removeRequest('request-1'));
        
        const state = store.getState().api;
        expect(state.activeRequests).toHaveLength(1);
        expect(state.activeRequests).toEqual(['request-2']);
      });

      it('should set loading to false when no active requests', () => {
        store.dispatch(addRequest('request-1'));
        expect(store.getState().api.loading).toBe(true);
        
        store.dispatch(removeRequest('request-1'));
        expect(store.getState().api.loading).toBe(false);
      });

      it('should keep loading true when other requests are active', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(addRequest('request-2'));
        store.dispatch(removeRequest('request-1'));
        
        expect(store.getState().api.loading).toBe(true);
      });

      it('should handle removing non-existent request', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(removeRequest('request-2')); // Non-existent
        
        const state = store.getState().api;
        expect(state.activeRequests).toEqual(['request-1']);
      });

      it('should clear all requests', () => {
        store.dispatch(addRequest('request-1'));
        store.dispatch(addRequest('request-2'));
        store.dispatch(addRequest('request-3'));
        store.dispatch(clearAllRequests());
        
        const state = store.getState().api;
        expect(state.activeRequests).toHaveLength(0);
        expect(state.loading).toBe(false);
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      api: {
        loading: true,
        error: 'Test error',
        activeRequests: ['request-1', 'request-2'],
      } as ApiState,
    };

    it('should select api state', () => {
      expect(selectApi(mockState as any)).toEqual(mockState.api);
    });

    it('should select loading state', () => {
      expect(selectIsLoading(mockState as any)).toBe(true);
    });

    it('should select error', () => {
      expect(selectError(mockState as any)).toBe('Test error');
    });

    it('should select active requests', () => {
      expect(selectActiveRequests(mockState as any)).toEqual(['request-1', 'request-2']);
    });

    it('should check if specific request is active', () => {
      expect(selectIsRequestActive(mockState as any, 'request-1')).toBe(true);
      expect(selectIsRequestActive(mockState as any, 'request-3')).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle concurrent request lifecycle', () => {
      // Start multiple requests
      store.dispatch(addRequest('fetch-users'));
      store.dispatch(addRequest('fetch-profile'));
      store.dispatch(addRequest('fetch-settings'));
      
      expect(store.getState().api.loading).toBe(true);
      expect(store.getState().api.activeRequests).toHaveLength(3);

      // Complete requests one by one
      store.dispatch(removeRequest('fetch-users'));
      expect(store.getState().api.loading).toBe(true); // Still loading

      store.dispatch(removeRequest('fetch-profile'));
      expect(store.getState().api.loading).toBe(true); // Still loading

      // Error occurs
      store.dispatch(setError('Network timeout'));
      expect(store.getState().api.error).toBe('Network timeout');
      
      // Complete last request
      store.dispatch(removeRequest('fetch-settings'));
      expect(store.getState().api.loading).toBe(false);
      expect(store.getState().api.activeRequests).toHaveLength(0);
    });

    it('should maintain error state across multiple requests', () => {
      store.dispatch(setError('Initial error'));
      store.dispatch(addRequest('new-request'));
      
      // Error should remain until explicitly cleared
      expect(store.getState().api.error).toBe('Initial error');
      expect(store.getState().api.loading).toBe(true);
      
      store.dispatch(clearError());
      expect(store.getState().api.error).toBeNull();
    });
  });
});
