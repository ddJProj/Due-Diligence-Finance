// frontend/src/components/common/ConfirmDialog.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        isOpen={false}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should display default buttons', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('should display custom button labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );

    const backdrop = screen.getByTestId('confirm-dialog-backdrop');
    await user.click(backdrop);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should not close on backdrop click when closeOnBackdrop is false', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
        closeOnBackdrop={false}
      />
    );

    const backdrop = screen.getByTestId('confirm-dialog-backdrop');
    await user.click(backdrop);

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should handle different variants', () => {
    const { rerender } = render(
      <ConfirmDialog
        {...defaultProps}
        variant="danger"
      />
    );

    expect(screen.getByRole('dialog')).toHaveClass('confirm-dialog--danger');

    rerender(
      <ConfirmDialog
        {...defaultProps}
        variant="warning"
      />
    );

    expect(screen.getByRole('dialog')).toHaveClass('confirm-dialog--warning');

    rerender(
      <ConfirmDialog
        {...defaultProps}
        variant="info"
      />
    );

    expect(screen.getByRole('dialog')).toHaveClass('confirm-dialog--info');
  });

  it('should display loading state on confirm button', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        isLoading={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveClass('confirm-dialog__button--loading');
  });

  it('should disable cancel button when loading', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        isLoading={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it('should close on Escape key press', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
      />
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should not close on Escape when closeOnEscape is false', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
        closeOnEscape={false}
      />
    );

    await user.keyboard('{Escape}');

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should focus confirm button by default', async () => {
    render(<ConfirmDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm/i })).toHaveFocus();
    });
  });

  it('should focus cancel button when focusButton is cancel', async () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        focusButton="cancel"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    });
  });

  it('should trap focus within dialog', async () => {
    const user = userEvent.setup();
    
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Start at confirm button
    confirmButton.focus();
    expect(confirmButton).toHaveFocus();

    // Tab to cancel button
    await user.tab();
    expect(cancelButton).toHaveFocus();

    // Tab should cycle back to confirm button
    await user.tab();
    expect(confirmButton).toHaveFocus();

    // Shift+Tab should go back to cancel button
    await user.tab({ shift: true });
    expect(cancelButton).toHaveFocus();
  });

  it('should render with custom className', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        className="custom-dialog"
      />
    );

    expect(screen.getByRole('dialog')).toHaveClass('custom-dialog');
  });

  it('should render custom content when provided', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        content={
          <div>
            <p>This action cannot be undone.</p>
            <p>All data will be permanently deleted.</p>
          </div>
        }
      />
    );

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('All data will be permanently deleted.')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should prevent body scroll when open', () => {
    const { unmount } = render(<ConfirmDialog {...defaultProps} />);

    expect(document.body).toHaveStyle('overflow: hidden');

    unmount();

    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should handle async confirm action', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmDialog
        {...defaultProps}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalled();
  });
});
