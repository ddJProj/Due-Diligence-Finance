// frontend/src/pages/shared/MessageThreadPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MessageThreadPage from './MessageThreadPage';
import { messageService } from '@/api/MessageService';
import { authSlice } from '@/store/slices/authSlice';
import type { MessageThread, MessageDTO } from '@/types';

// Mock the message service
vi.mock('@/api/MessageService', () => ({
  messageService: {
    getThread: vi.fn(),
    replyToMessage: vi.fn(),
    markAsRead: vi.fn(),
    archiveMessage: vi.fn(),
    deleteMessage: vi.fn(),
    saveDraft: vi.fn(),
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

describe('MessageThreadPage', () => {
  let store: any;
  const user = userEvent.setup();

  const mockThread: MessageThread = {
    id: 1,
    participants: [
      { userId: 1, name: 'John Client', role: 'CLIENT' },
      { userId: 2, name: 'Jane Employee', role: 'EMPLOYEE' },
    ],
    subject: 'Investment Strategy Discussion',
    lastMessage: {
      content: 'Thank you for the recommendations',
      senderId: 1,
      createdAt: '2024-12-15T16:00:00Z',
    },
    unreadCount: 0,
    totalMessages: 5,
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-15T16:00:00Z',
  };

  const mockMessages: MessageDTO[] = [
    {
      id: 1,
      threadId: 1,
      senderId: 1,
      senderName: 'John Client',
      senderRole: 'CLIENT',
      recipientId: 2,
      recipientName: 'Jane Employee',
      recipientRole: 'EMPLOYEE',
      subject: 'Investment Strategy Discussion',
      content: 'I would like to discuss my investment strategy for 2025.',
      status: 'READ',
      priority: 'NORMAL',
      createdAt: '2024-12-10T10:00:00Z',
      readAt: '2024-12-10T10:30:00Z',
      attachments: [],
    },
    {
      id: 2,
      threadId: 1,
      senderId: 2,
      senderName: 'Jane Employee',
      senderRole: 'EMPLOYEE',
      recipientId: 1,
      recipientName: 'John Client',
      recipientRole: 'CLIENT',
      subject: 'Re: Investment Strategy Discussion',
      content: 'I have prepared some recommendations based on your risk profile.',
      status: 'READ',
      priority: 'NORMAL',
      createdAt: '2024-12-10T14:00:00Z',
      readAt: '2024-12-10T15:00:00Z',
      attachments: [
        {
          id: 1,
          filename: 'investment-recommendations.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          uploadedAt: '2024-12-10T14:00:00Z',
        },
      ],
    },
    {
      id: 3,
      threadId: 1,
      senderId: 1,
      senderName: 'John Client',
      senderRole: 'CLIENT',
      recipientId: 2,
      recipientName: 'Jane Employee',
      recipientRole: 'EMPLOYEE',
      subject: 'Re: Investment Strategy Discussion',
      content: 'Thank you for the recommendations',
      status: 'READ',
      priority: 'NORMAL',
      createdAt: '2024-12-15T16:00:00Z',
      readAt: '2024-12-15T16:05:00Z',
      attachments: [],
    },
  ];

  const mockThreadWithMessages = {
    ...mockThread,
    messages: mockMessages,
  };

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

  const renderMessageThreadPage = (threadId: string = '1') => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/messages/${threadId}`]}>
          <Routes>
            <Route path="/messages/:threadId" element={<MessageThreadPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display loading state while fetching thread', () => {
    vi.mocked(messageService.getThread).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderMessageThreadPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading conversation/i)).toBeInTheDocument();
  });

  it('should display thread messages after loading', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Investment Strategy Discussion')).toBeInTheDocument();
      expect(screen.getByText('I would like to discuss my investment strategy for 2025.')).toBeInTheDocument();
      expect(screen.getByText('I have prepared some recommendations based on your risk profile.')).toBeInTheDocument();
      expect(screen.getByText('Thank you for the recommendations')).toBeInTheDocument();
    });
  });

  it('should display participant information', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Jane Employee')).toBeInTheDocument();
      expect(screen.getByText('EMPLOYEE')).toBeInTheDocument();
    });
  });

  it('should display attachments', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('investment-recommendations.pdf')).toBeInTheDocument();
      expect(screen.getByText(/1.00 MB/i)).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to load thread');
    vi.mocked(messageService.getThread).mockRejectedValue(error);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load conversation/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should handle reply submission', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);
    vi.mocked(messageService.replyToMessage).mockResolvedValue({
      id: 4,
      threadId: 1,
      senderId: 1,
      senderName: 'John Client',
      senderRole: 'CLIENT',
      recipientId: 2,
      recipientName: 'Jane Employee',
      recipientRole: 'EMPLOYEE',
      subject: 'Re: Investment Strategy Discussion',
      content: 'I have a follow-up question',
      status: 'UNREAD',
      priority: 'NORMAL',
      createdAt: '2024-12-16T10:00:00Z',
      attachments: [],
    });

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    });

    // Type reply
    const replyInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(replyInput, 'I have a follow-up question');

    // Send reply
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    expect(vi.mocked(messageService.replyToMessage)).toHaveBeenCalledWith(1, {
      subject: 'Re: Investment Strategy Discussion',
      content: 'I have a follow-up question',
      priority: 'NORMAL',
    });
  });

  it('should mark messages as read', async () => {
    const unreadThread = {
      ...mockThreadWithMessages,
      messages: mockMessages.map((msg, index) => ({
        ...msg,
        status: index === 2 ? 'UNREAD' : 'READ',
      })),
      unreadCount: 1,
    };

    vi.mocked(messageService.getThread).mockResolvedValue(unreadThread);
    vi.mocked(messageService.markAsRead).mockResolvedValue();

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Investment Strategy Discussion')).toBeInTheDocument();
    });

    // Should automatically mark unread messages as read
    expect(vi.mocked(messageService.markAsRead)).toHaveBeenCalledWith(3);
  });

  it('should handle back navigation', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Investment Strategy Discussion')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('should handle archive action', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);
    vi.mocked(messageService.archiveMessage).mockResolvedValue();

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Investment Strategy Discussion')).toBeInTheDocument();
    });

    const archiveButton = screen.getByRole('button', { name: /archive conversation/i });
    await user.click(archiveButton);

    // Confirm dialog should appear
    expect(screen.getByText(/are you sure you want to archive/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(vi.mocked(messageService.archiveMessage)).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('should handle delete action', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);
    vi.mocked(messageService.deleteMessage).mockResolvedValue();

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('Investment Strategy Discussion')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete conversation/i });
    await user.click(deleteButton);

    // Confirm dialog should appear
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(vi.mocked(messageService.deleteMessage)).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/messages');
  });

  it('should display priority badges for high priority messages', async () => {
    const highPriorityThread = {
      ...mockThreadWithMessages,
      messages: [
        ...mockMessages.slice(0, 2),
        {
          ...mockMessages[2],
          priority: 'HIGH' as const,
        },
      ],
    };

    vi.mocked(messageService.getThread).mockResolvedValue(highPriorityThread);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });
  });

  it('should save draft when typing', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);
    vi.mocked(messageService.saveDraft).mockResolvedValue(1);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    });

    const replyInput = screen.getByPlaceholderText(/type your message/i);
    await user.type(replyInput, 'Draft message');

    // Wait for debounced save
    await waitFor(() => {
      expect(vi.mocked(messageService.saveDraft)).toHaveBeenCalledWith({
        recipientId: 2,
        subject: 'Re: Investment Strategy Discussion',
        content: 'Draft message',
      });
    }, { timeout: 2000 });
  });

  it('should format timestamps correctly', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      // Check for formatted dates
      expect(screen.getByText(/Dec 10, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/Dec 15, 2024/i)).toBeInTheDocument();
    });
  });

  it('should disable send button when message is empty', async () => {
    vi.mocked(messageService.getThread).mockResolvedValue(mockThreadWithMessages);

    renderMessageThreadPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
});
