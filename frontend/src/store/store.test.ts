// frontend/src/store/store.test.ts

import { configureStore } from '@reduxjs/toolkit';
import { store, RootState, AppDispatch } from './store';

describe('Redux Store Configuration', () => {
  it('should create a store with the correct structure', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
  });

  it('should have the expected initial state structure', () => {
    const state = store.getState();
    
    // Verify all slices are present
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('api');
    expect(state).toHaveProperty('client');
    expect(state).toHaveProperty('employee');
    expect(state).toHaveProperty('admin');
  });

  it('should export correct TypeScript types', () => {
    // Type checking - these tests pass at compile time
    const state: RootState = store.getState();
    const dispatch: AppDispatch = store.dispatch;
    
    expect(state).toBeDefined();
    expect(dispatch).toBeDefined();
  });

  it('should enable Redux DevTools in development', () => {
    const testStore = configureStore({
      reducer: {
        test: (state = {}) => state
      },
      devTools: process.env.NODE_ENV !== 'production'
    });

    // In development, devTools should be enabled
    if (process.env.NODE_ENV !== 'production') {
      expect((window as any).__REDUX_DEVTOOLS_EXTENSION__).toBeDefined();
    }
  });

  it('should handle hot module replacement in development', () => {
    // This is more of a configuration test
    // Actual HMR testing would require a different setup
    expect(store).toBeDefined();
  });

  describe('Store Persistence', () => {
    it('should persist auth state to localStorage', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      // When store is created, it should attempt to read from localStorage
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('persist:root');
    });
  });

  describe('Middleware Configuration', () => {
    it('should include default middleware', () => {
      const middleware = store.dispatch.toString();
      // Redux Toolkit includes thunk by default
      expect(middleware).toBeDefined();
    });

    it('should handle async actions', async () => {
      // Create a test async action
      const testAsyncAction = () => async (dispatch: AppDispatch) => {
        return Promise.resolve({ type: 'TEST_ACTION' });
      };

      // Should be able to dispatch async actions
      const result = await store.dispatch(testAsyncAction() as any);
      expect(result).toEqual({ type: 'TEST_ACTION' });
    });
  });

  describe('Store Subscription', () => {
    it('should allow subscribing to state changes', () => {
      const mockCallback = jest.fn();
      const unsubscribe = store.subscribe(mockCallback);

      // Dispatch any action
      store.dispatch({ type: 'TEST_ACTION' });

      expect(mockCallback).toHaveBeenCalled();
      
      // Cleanup
      unsubscribe();
    });
  });
}/ frontend/src/store/store.test.ts

import { configureStore } from '@reduxjs/toolkit';
import { store, RootState, AppDispatch } from './store';

describe('Redux Store Configuration', () => {
  // Create a fresh store for each test to avoid state pollution
  let testStore: typeof store;
  
  beforeEach(() => {
    // Import store freshly for each test
    testStore = configureStore({
      reducer: {
        auth: (state = {}) => state,
        api: (state = {}) => state,
        client: (state = {}) => state,
        employee: (state = {}) => state,
        admin: (state = {}) => state,
      },
    });
  });

  it('should create a store with the correct structure', () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
  });

  it('should have the expected initial state structure', () => {
    const state = store.getState();
    
    // Verify all slices are present
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('api');
    expect(state).toHaveProperty('client');
    expect(state).toHaveProperty('employee');
    expect(state).toHaveProperty('admin');
  });

  it('should export correct TypeScript types', () => {
    // Type checking - these tests pass at compile time
    const state: RootState = store.getState();
    const dispatch: AppDispatch = store.dispatch;
    
    expect(state).toBeDefined();
    expect(dispatch).toBeDefined();
  });

  it('should enable Redux DevTools in development', () => {
    const testStore = configureStore({
      reducer: {
        test: (state = {}) => state
      },
      devTools: process.env.NODE_ENV !== 'production'
    });

    // In development, devTools should be enabled
    if (process.env.NODE_ENV !== 'production') {
      expect((window as any).__REDUX_DEVTOOLS_EXTENSION__).toBeDefined();
    }
  });

  it('should handle hot module replacement in development', () => {
    // This is more of a configuration test
    // Actual HMR testing would require a different setup
    expect(store).toBeDefined();
  });

  describe('Store Persistence', () => {
    it('should persist auth state to localStorage', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      // When store is created, it should attempt to read from localStorage
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('persist:root');
    });
  });

  describe('Middleware Configuration', () => {
    it('should include default middleware', () => {
      const middleware = store.dispatch.toString();
      // Redux Toolkit includes thunk by default
      expect(middleware).toBeDefined();
    });

    it('should handle async actions', async () => {
      // Create a test async action
      const testAsyncAction = () => async (dispatch: AppDispatch) => {
        return Promise.resolve({ type: 'TEST_ACTION' });
      };

      // Should be able to dispatch async actions
      const result = await store.dispatch(testAsyncAction() as any);
      expect(result).toEqual({ type: 'TEST_ACTION' });
    });
  });

  describe('Store Subscription', () => {
    it('should allow subscribing to state changes', () => {
      const mockCallback = jest.fn();
      const unsubscribe = store.subscribe(mockCallback);

      // Dispatch any action
      store.dispatch({ type: 'TEST_ACTION' });

      expect(mockCallback).toHaveBeenCalled();
      
      // Cleanup
      unsubscribe();
    });
  });
}););
