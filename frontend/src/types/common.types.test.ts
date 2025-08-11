// frontend/src/types/common.types.test.ts
import { describe, it, expect } from 'vitest';
import type { Role, InvestmentStatus, TransactionType, PaginationRequest, PaginationResponse, ApiError } from './common.types';

describe('Common Types', () => {
  describe('Role Enum', () => {
    it('should have all required roles', () => {
      const roles: Role[] = ['GUEST', 'CLIENT', 'EMPLOYEE', 'ADMIN'];
      
      roles.forEach(role => {
        expect(['GUEST', 'CLIENT', 'EMPLOYEE', 'ADMIN']).toContain(role);
      });
    });
  });

  describe('InvestmentStatus Enum', () => {
    it('should have all investment statuses', () => {
      const statuses: InvestmentStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
      
      statuses.forEach(status => {
        expect(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).toContain(status);
      });
    });
  });

  describe('TransactionType Enum', () => {
    it('should have all transaction types', () => {
      const types: TransactionType[] = ['BUY', 'SELL', 'DIVIDEND', 'FEE'];
      
      types.forEach(type => {
        expect(['BUY', 'SELL', 'DIVIDEND', 'FEE']).toContain(type);
      });
    });
  });

  describe('PaginationRequest', () => {
    it('should have correct structure', () => {
      const validRequest: PaginationRequest = {
        page: 0,
        size: 20,
        sort: 'createdAt,DESC',
      };

      expect(validRequest.page).toBe(0);
      expect(validRequest.size).toBe(20);
      expect(validRequest.sort).toBe('createdAt,DESC');
    });

    it('should allow optional sort parameter', () => {
      const validRequest: PaginationRequest = {
        page: 1,
        size: 10,
      };

      expect(validRequest.sort).toBeUndefined();
    });
  });

  describe('PaginationResponse', () => {
    it('should have correct structure for paginated data', () => {
      interface TestItem {
        id: number;
        name: string;
      }

      const validResponse: PaginationResponse<TestItem> = {
        content: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        totalElements: 50,
        totalPages: 5,
        number: 0,
        size: 10,
        first: true,
        last: false,
        numberOfElements: 2,
      };

      expect(validResponse.content).toHaveLength(2);
      expect(validResponse.totalElements).toBe(50);
      expect(validResponse.totalPages).toBe(5);
      expect(validResponse.first).toBe(true);
      expect(validResponse.last).toBe(false);
    });
  });

  describe('ApiError', () => {
    it('should have correct structure for API errors', () => {
      const validError: ApiError = {
        timestamp: '2025-01-15T10:00:00Z',
        status: 400,
        error: 'Bad Request',
        message: 'Invalid email format',
        path: '/api/auth/login',
      };

      expect(validError.timestamp).toBeDefined();
      expect(validError.status).toBe(400);
      expect(validError.error).toBe('Bad Request');
      expect(validError.message).toBe('Invalid email format');
      expect(validError.path).toBe('/api/auth/login');
    });

    it('should support validation errors', () => {
      const validationError: ApiError = {
        timestamp: '2025-01-15T10:00:00Z',
        status: 422,
        error: 'Validation Failed',
        message: 'Validation failed',
        path: '/api/auth/register',
        validationErrors: {
          email: 'Email is already in use',
          password: 'Password must be at least 8 characters',
        },
      };

      expect(validationError.validationErrors).toBeDefined();
      expect(validationError.validationErrors?.email).toBe('Email is already in use');
      expect(validationError.validationErrors?.password).toBe('Password must be at least 8 characters');
    });
  });
});
