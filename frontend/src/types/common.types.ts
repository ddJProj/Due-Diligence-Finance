// frontend/src/types/common.types.ts

export type Role = 'GUEST' | 'CLIENT' | 'EMPLOYEE' | 'ADMIN';

export type InvestmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE';

export interface PaginationRequest {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
