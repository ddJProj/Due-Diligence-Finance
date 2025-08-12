// frontend/src/store/slices/apiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface ApiState {
  loading: boolean;
  error: string | null;
  activeRequests: string[];
}

const initialState: ApiState = {
  loading: false,
  error: null,
  activeRequests: [],
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.loading = false; // Clear loading on error
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    addRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      if (!state.activeRequests.includes(requestId)) {
        state.activeRequests.push(requestId);
        state.loading = true;
      }
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.activeRequests = state.activeRequests.filter(id => id !== requestId);
      
      // Set loading to false if no more active requests
      if (state.activeRequests.length === 0) {
        state.loading = false;
      }
    },
    clearAllRequests: (state) => {
      state.activeRequests = [];
      state.loading = false;
    },
  },
});

// Actions
export const {
  setLoading,
  setError,
  clearError,
  addRequest,
  removeRequest,
  clearAllRequests,
} = apiSlice.actions;

// Selectors
export const selectApi = (state: RootState) => state.api;
export const selectIsLoading = (state: RootState) => state.api.loading;
export const selectError = (state: RootState) => state.api.error;
export const selectActiveRequests = (state: RootState) => state.api.activeRequests;
export const selectIsRequestActive = (state: RootState, requestId: string) => 
  state.api.activeRequests.includes(requestId);

// Reducer
export default apiSlice.reducer;
