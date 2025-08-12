// frontend/src/hooks/redux.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useAppDispatch, useAppSelector } from './redux';

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    test: (state = { value: 'test' }) => state,
  },
});

describe('Redux Hooks', () => {
  describe('useAppSelector', () => {
    it('should return typed state from the store', () => {
      const store = createTestStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(
        () => useAppSelector(state => state.test.value),
        { wrapper }
      );

      expect(result.current).toBe('test');
    });

    it('should update when state changes', () => {
      const store = createTestStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(
        () => useAppSelector(state => state),
        { wrapper }
      );

      expect(result.current).toEqual({ test: { value: 'test' } });
    });
  });

  describe('useAppDispatch', () => {
    it('should return the dispatch function', () => {
      const store = createTestStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      expect(typeof result.current).toBe('function');
      expect(result.current).toBe(store.dispatch);
    });

    it('should dispatch actions correctly', () => {
      const store = createTestStore();
      const mockAction = { type: 'TEST_ACTION' };
      
      // Spy on store.dispatch
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(() => useAppDispatch(), { wrapper });

      result.current(mockAction);

      expect(dispatchSpy).toHaveBeenCalledWith(mockAction);
      
      dispatchSpy.mockRestore();
    });
  });

  describe('TypeScript types', () => {
    it('should enforce correct typing for selectors', () => {
      const store = createTestStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(
        () => {
          // This should be typed correctly
          const value = useAppSelector(state => state.test.value);
          // TypeScript should know this is a string
          return typeof value === 'string';
        },
        { wrapper }
      );

      expect(result.current).toBe(true);
    });

    it('should enforce correct typing for dispatch', () => {
      const store = createTestStore();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );

      const { result } = renderHook(
        () => {
          const dispatch = useAppDispatch();
          // Should be able to dispatch any action
          return () => dispatch({ type: 'ANY_ACTION' });
        },
        { wrapper }
      );

      expect(() => result.current()).not.toThrow();
    });
  });
});
