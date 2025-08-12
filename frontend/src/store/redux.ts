// frontend/src/hooks/redux.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';

/**
 * Typed version of useDispatch hook
 * Use this throughout the app instead of plain `useDispatch`
 * 
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(login({ username, password }));
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Use this throughout the app instead of plain `useSelector`
 * 
 * @example
 * const user = useAppSelector(state => state.auth.user);
 * const isAuthenticated = useAppSelector(selectIsAuthenticated);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
