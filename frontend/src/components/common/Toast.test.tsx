// frontend/src/components/common/Toast.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toast, ToastProvider, useToast } from './Toast';

// Test component that uses the toast hook
const TestComponent: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Test message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showToast('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => showToast('Info message', 'info')}>
        Show Info
      </button>
      <button 
        onClick={() => showToast('Custom duration', 'success', 1000)}
      >
        Show Custom Duration
      </button>
    </div>
  );
};

describe('Toast', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Test content</div>
        </ToastProvider>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should provide toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByRole('button', { name: /show success/i })).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        const InvalidComponent = () => {
          useToast();
          return null;
        };
        render(<InvalidComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Toast display', () => {
    it('should show success toast when triggered', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('toast--success');
    });

    it('should show error toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show error/i }));

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('toast--error');
    });

    it('should show warning toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show warning/i }));

      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('toast--warning');
    });

    it('should show info toast with correct styling', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show info/i }));

      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveClass('toast--info');
    });
  });

  describe('Toast auto-dismiss', () => {
    it('should auto-dismiss after default duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByText('Test message')).toBeInTheDocument();

      // Fast-forward default duration (3000ms)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should auto-dismiss after custom duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show custom duration/i }));
      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Should still be visible after 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText('Custom duration')).toBeInTheDocument();

      // Should be dismissed after 1000ms
      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.queryByText('Custom duration')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast close button', () => {
    it('should close toast when close button is clicked', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      expect(screen.getByText('Test message')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should clear timeout when manually closed', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Advance timers to ensure no delayed dismissal
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  describe('Multiple toasts', () => {
    it('should display multiple toasts simultaneously', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));
      await user.click(screen.getByRole('button', { name: /show warning/i }));

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getAllByRole('alert')).toHaveLength(3);
    });

    it('should stack toasts vertically', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));

      const toasts = screen.getAllByRole('alert');
      expect(toasts).toHaveLength(2);
      
      // Check that container has correct class
      const container = toasts[0].parentElement;
      expect(container).toHaveClass('toast-container');
    });

    it('should remove toasts independently', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));

      // Close first toast
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });
  });

  describe('Toast icons', () => {
    it('should display success icon for success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      
      const toast = screen.getByRole('alert');
      expect(toast.querySelector('.toast__icon--success')).toBeInTheDocument();
    });

    it('should display error icon for error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show error/i }));
      
      const toast = screen.getByRole('alert');
      expect(toast.querySelector('.toast__icon--error')).toBeInTheDocument();
    });

    it('should display warning icon for warning toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show warning/i }));
      
      const toast = screen.getByRole('alert');
      expect(toast.querySelector('.toast__icon--warning')).toBeInTheDocument();
    });

    it('should display info icon for info toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show info/i }));
      
      const toast = screen.getByRole('alert');
      expect(toast.querySelector('.toast__icon--info')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard accessible', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      const closeButton = screen.getByRole('button', { name: /close/i });
      closeButton.focus();
      expect(closeButton).toHaveFocus();

      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });
  });
});
