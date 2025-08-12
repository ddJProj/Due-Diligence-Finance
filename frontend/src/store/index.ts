// frontend/src/store/index.ts

// Export store and types
export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';

// Export all slices and their actions/selectors
export * from './slices/authSlice';
export * from './slices/apiSlice';
export * from './slices/clientSlice';
export * from './slices/employeeSlice';
export * from './slices/adminSlice';
