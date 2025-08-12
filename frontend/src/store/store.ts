// frontend/src/store/store.ts

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import slices (to be implemented)
import authReducer from './slices/authSlice';
import apiReducer from './slices/apiSlice';
import clientReducer from './slices/clientSlice';
import employeeReducer from './slices/employeeSlice';
import adminReducer from './slices/adminSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: ['api'], // Don't persist API state (loading, errors)
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  api: apiReducer,
  client: clientReducer,
  employee: employeeReducer,
  admin: adminReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Enable hot module replacement for reducers
if (import.meta.hot && process.env.NODE_ENV !== 'production') {
  import.meta.hot.accept('./slices/authSlice', () => {
    store.replaceReducer(persistedReducer);
  });
  import.meta.hot.accept('./slices/apiSlice', () => {
    store.replaceReducer(persistedReducer);
  });
  import.meta.hot.accept('./slices/clientSlice', () => {
    store.replaceReducer(persistedReducer);
  });
  import.meta.hot.accept('./slices/employeeSlice', () => {
    store.replaceReducer(persistedReducer);
  });
  import.meta.hot.accept('./slices/adminSlice', () => {
    store.replaceReducer(persistedReducer);
  });
}
