// frontend/src/pages/shared/ComposeMessagePage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ComposeMessagePage from './ComposeMessagePage';
import { messageService } from '@/api/MessageService';
import { authSlice } from '@/store/slices/authSlice';
import type { CreateMessageRequest } from '@/types';

// Mock the message service
vi.mock('@/api/MessageService', () => ({
  messageService: {
    getRecipients: vi.fn(),
    searchRecipients: vi.fn(),
    sendMessage: vi.fn(),
    saveDraft: vi.fn(),
    getDrafts: vi.fn(),
    deleteDraft: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ComposeMessagePage', () => {
  let store: any;
  const user = userEvent.setup();

  const mockRecipients = [
    { id: 2, name: 'Jane Employee', role: 'EMPLOYEE' },
    { id: 3, name: 'Bob Admin', role: 'ADMIN' },
    { id: 4, name: 'Alice Employee', role: 'EMPLOYEE' },
  ];

  const mockDrafts = [
    {
      id: 1,
      recipientId: 2,
      subject: 'Draft: Investment Question',
      content: 'I wanted to ask about...',
      priority: 'NORMAL' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            email: 'john@example.com',
            name: 'John Client',
            role: 'CLIENT',
          },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    });
  });

  const renderComposeMessagePage = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ComposeMessagePage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue([]);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    expect(screen.getByText('Compose Message')).toBeInTheDocument();
  });

  it('should load recipients on mount', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    await waitFor(() => {
      expect(vi.mocked(messageService.getRecipients)).toHaveBeenCalled();
    });
  });

  it('should display form fields', () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('should search recipients when typing', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.searchRecipients).mockResolvedValue([mockRecipients[0]]);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);
    await user.type(recipientInput, 'jane');

    await waitFor(() => {
      expect(vi.mocked(messageService.searchRecipients)).toHaveBeenCalledWith('jane');
    });
  });

  it('should display recipient suggestions', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);

    await waitFor(() => {
      expect(screen.getByText('Jane Employee')).toBeInTheDocument();
      expect(screen.getByText('EMPLOYEE')).toBeInTheDocument();
      expect(screen.getByText('Bob Admin')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  it('should select recipient from suggestions', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);

    await waitFor(() => {
      expect(screen.getByText('Jane Employee')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Jane Employee'));

    expect(recipientInput).toHaveValue('Jane Employee');
  });

  it('should validate required fields', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/recipient is required/i)).toBeInTheDocument();
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message content is required/i)).toBeInTheDocument();
    });
  });

  it('should send message with valid data', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);
    vi.mocked(messageService.sendMessage).mockResolvedValue({
      id: 100,
      threadId: 10,
      senderId: 1,
      senderName: 'John Client',
      senderRole: 'CLIENT',
      recipientId: 2,
      recipientName: 'Jane Employee',
      recipientRole: 'EMPLOYEE',
      subject: 'Investment Question',
      content: 'I have a question about my portfolio',
      status: 'UNREAD',
      priority: 'NORMAL',
      createdAt: new Date().toISOString(),
      attachments: [],
    });

    renderComposeMessagePage();

    // Select recipient
    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);
    await user.click(screen.getByText('Jane Employee'));

    // Fill form
    await user.type(screen.getByLabelText(/subject/i), 'Investment Question');
    await user.type(screen.getByLabelText(/message/i), 'I have a question about my portfolio');

    // Send message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    const expectedRequest: CreateMessageRequest = {
      recipientId: 2,
      subject: 'Investment Question',
      content: 'I have a question about my portfolio',
      priority: 'NORMAL',
    };

    expect(vi.mocked(messageService.sendMessage)).toHaveBeenCalledWith(expectedRequest);
    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('should handle priority selection', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.selectOptions(prioritySelect, 'HIGH');

    expect(prioritySelect).toHaveValue('HIGH');
  });

  it('should save draft automatically', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);
    vi.mocked(messageService.saveDraft).mockResolvedValue(1);

    renderComposeMessagePage();

    // Select recipient and type message
    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);
    await user.click(screen.getByText('Jane Employee'));

    await user.type(screen.getByLabelText(/subject/i), 'Draft Subject');
    await user.type(screen.getByLabelText(/message/i), 'Draft content');

    // Wait for auto-save
    await waitFor(() => {
      expect(vi.mocked(messageService.saveDraft)).toHaveBeenCalledWith({
        recipientId: 2,
        subject: 'Draft Subject',
        content: 'Draft content',
        priority: 'NORMAL',
      });
    }, { timeout: 3000 });
  });

  it('should load and display drafts', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue(mockDrafts);

    renderComposeMessagePage();

    await waitFor(() => {
      expect(screen.getByText(/saved drafts/i)).toBeInTheDocument();
      expect(screen.getByText('Draft: Investment Question')).toBeInTheDocument();
    });
  });

  it('should load draft when clicked', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue(mockDrafts);

    renderComposeMessagePage();

    await waitFor(() => {
      expect(screen.getByText('Draft: Investment Question')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Draft: Investment Question'));

    expect(screen.getByLabelText(/recipient/i)).toHaveValue('Jane Employee');
    expect(screen.getByLabelText(/subject/i)).toHaveValue('Draft: Investment Question');
    expect(screen.getByLabelText(/message/i)).toHaveValue('I wanted to ask about...');
  });

  it('should delete draft', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue(mockDrafts);
    vi.mocked(messageService.deleteDraft).mockResolvedValue();

    renderComposeMessagePage();

    await waitFor(() => {
      expect(screen.getByText('Draft: Investment Question')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete draft/i });
    await user.click(deleteButton);

    expect(vi.mocked(messageService.deleteDraft)).toHaveBeenCalledWith(1);
  });

  it('should show loading state while sending', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);
    vi.mocked(messageService.sendMessage).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderComposeMessagePage();

    // Fill form
    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);
    await user.click(screen.getByText('Jane Employee'));
    await user.type(screen.getByLabelText(/subject/i), 'Test');
    await user.type(screen.getByLabelText(/message/i), 'Test message');

    // Send message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(sendButton).toBeDisabled();
  });

  it('should handle send error', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);
    vi.mocked(messageService.sendMessage).mockRejectedValue(new Error('Send failed'));

    renderComposeMessagePage();

    // Fill form
    const recipientInput = screen.getByLabelText(/recipient/i);
    await user.click(recipientInput);
    await user.click(screen.getByText('Jane Employee'));
    await user.type(screen.getByLabelText(/subject/i), 'Test');
    await user.type(screen.getByLabelText(/message/i), 'Test message');

    // Send message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });

  it('should cancel and navigate back', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('should warn before leaving with unsaved changes', async () => {
    vi.mocked(messageService.getRecipients).mockResolvedValue(mockRecipients);
    vi.mocked(messageService.getDrafts).mockResolvedValue([]);

    renderComposeMessagePage();

    // Make changes
    await user.type(screen.getByLabelText(/subject/i), 'Unsaved subject');

    // Try to cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Confirm dialog should appear
    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();

    // Confirm leaving
    const confirmButton = screen.getByRole('button', { name: /leave/i });
    await user.click(confirmButton);

    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });
});
