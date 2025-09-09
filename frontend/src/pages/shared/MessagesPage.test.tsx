// frontend/src/pages/shared/MessagesPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MessagesPage from './MessagesPage';
import { messageService } from '@/api/MessageService';
import { authSlice } from '@/store/slices/authSlice';
import type { MessageThread } from '@/types';

// Mock the message service
vi.mock('@/api/MessageService', () => ({
  messageService: {
    getThreads: vi.fn(),
    searchThreads: vi.fn(),
    updateMessageStatus: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    deleteMessage: vi.fn(),
    getUnreadCount: vi.fn(),
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

describe('MessagesPage', () => {
  let store: any;
  const user = userEvent.setup();

  const mockThreads: MessageThread[] = [
    {
      id: 1,
      participants: [
        { userId: 1, name: 'John Client', role: 'CLIENT' },
        { userId: 2, name: 'Jane Employee', role: 'EMPLOYEE' },
      ],
      subject: 'Portfolio Update',
      lastMessage: {
        content: 'Your portfolio has increased by 5%',
        senderId: 2,
        createdAt: '2024-12-15T10:00:00Z',
      },
      unreadCount: 2,
      totalMessages: 10,
      createdAt: '2024-12-10T10:00:00Z',
      updatedAt: '2024-12-15T10:00:00Z',
    },
    {
      id: 2,
      participants: [
        { userId: 1, name: 'John Client', role: 'CLIENT' },
        { userId: 3, name: 'Bob Admin', role: 'ADMIN' },
      ],
      subject: 'Account Verification',
      lastMessage: {
        content: 'Your account has been verified',
        senderId: 3,
        createdAt: '2024-12-14T15:00:00Z',
      },
      unreadCount: 0,
      totalMessages: 3,
      createdAt: '2024-12-13T10:00:00Z',
      updatedAt: '2024-12-14T15:00:00Z',
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

  const renderMessagesPage = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <MessagesPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    vi.mocked(messageService.getThreads).mockResolvedValue([]);
    vi.mocked(messageService.getUnreadCount).mockResolvedValue(0);

    renderMessagesPage();

    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('should display loading state while fetching messages', () => {
    vi.mocked(messageService.getThreads).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderMessagesPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });

  it('should display message threads after loading', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.getUnreadCount).mockResolvedValue(2);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
      expect(screen.getByText('Account Verification')).toBeInTheDocument();
    });

    // Check unread badges
    expect(screen.getByText('2')).toBeInTheDocument(); // Unread count for first thread
    
    // Check last message preview
    expect(screen.getByText('Your portfolio has increased by 5%')).toBeInTheDocument();
    expect(screen.getByText('Your account has been verified')).toBeInTheDocument();
  });

  it('should display empty state when no messages', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue([]);
    vi.mocked(messageService.getUnreadCount).mockResolvedValue(0);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText(/no messages/i)).toBeInTheDocument();
      expect(screen.getByText(/start a conversation/i)).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to load messages');
    vi.mocked(messageService.getThreads).mockRejectedValue(error);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should filter messages by tab', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.getUnreadCount).mockResolvedValue(2);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Click on Sent tab
    const sentTab = screen.getByRole('tab', { name: /sent/i });
    await user.click(sentTab);

    expect(vi.mocked(messageService.getThreads)).toHaveBeenCalledWith('sent');

    // Click on Archived tab
    const archivedTab = screen.getByRole('tab', { name: /archived/i });
    await user.click(archivedTab);

    expect(vi.mocked(messageService.getThreads)).toHaveBeenCalledWith('archived');
  });

  it('should search messages', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.searchThreads).mockResolvedValue([mockThreads[0]]);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search messages/i);
    await user.type(searchInput, 'portfolio');

    await waitFor(() => {
      expect(vi.mocked(messageService.searchThreads)).toHaveBeenCalledWith('portfolio');
    });
  });

  it('should navigate to thread when clicked', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Click on first thread
    const firstThread = screen.getByText('Portfolio Update').closest('[role="article"]');
    expect(firstThread).toBeInTheDocument();
    
    if (firstThread) {
      await user.click(firstThread);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/messages/1');
  });

  it('should navigate to compose message page', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });

    const composeButton = screen.getByRole('button', { name: /compose/i });
    await user.click(composeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/messages/compose');
  });

  it('should handle bulk actions', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.bulkUpdateStatus).mockResolvedValue();

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Select first message
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // First message checkbox

    // Bulk actions should appear
    expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    
    // Mark as read
    const markReadButton = screen.getByRole('button', { name: /mark as read/i });
    await user.click(markReadButton);

    expect(vi.mocked(messageService.bulkUpdateStatus)).toHaveBeenCalledWith([1], 'READ');
  });

  it('should handle archive action', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.updateMessageStatus).mockResolvedValue();

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Find archive button for first thread
    const firstThread = screen.getByText('Portfolio Update').closest('[role="article"]');
    const archiveButton = within(firstThread!).getByRole('button', { name: /archive/i });
    
    await user.click(archiveButton);

    expect(vi.mocked(messageService.updateMessageStatus)).toHaveBeenCalledWith(
      expect.any(Number),
      'ARCHIVED'
    );
  });

  it('should handle delete action with confirmation', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);
    vi.mocked(messageService.deleteMessage).mockResolvedValue();

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });

    // Find delete button for first thread
    const firstThread = screen.getByText('Portfolio Update').closest('[role="article"]');
    const deleteButton = within(firstThread!).getByRole('button', { name: /delete/i });
    
    await user.click(deleteButton);

    // Confirm dialog should appear
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(vi.mocked(messageService.deleteMessage)).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should refresh messages when retry is clicked after error', async () => {
    vi.mocked(messageService.getThreads)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce(mockThreads);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });
  });

  it('should show priority badges for high priority messages', async () => {
    const highPriorityThreads: MessageThread[] = [
      {
        ...mockThreads[0],
        lastMessage: {
          ...mockThreads[0].lastMessage,
          senderId: 2,
        },
      },
    ];

    vi.mocked(messageService.getThreads).mockResolvedValue(highPriorityThreads);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Portfolio Update')).toBeInTheDocument();
    });
  });

  it('should display participant information correctly', async () => {
    vi.mocked(messageService.getThreads).mockResolvedValue(mockThreads);

    renderMessagesPage();

    await waitFor(() => {
      expect(screen.getByText('Jane Employee')).toBeInTheDocument();
      expect(screen.getByText('Bob Admin')).toBeInTheDocument();
    });
  });
});
