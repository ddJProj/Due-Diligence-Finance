// frontend/src/api/MessageService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageService } from './MessageService';
import { apiClient } from './apiClient';
import type {
  MessageThread,
  MessageDTO,
  CreateMessageRequest,
  MessageNotification,
} from '@/types';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    vi.clearAllMocks();
    messageService = MessageService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = MessageService.getInstance();
      const instance2 = MessageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Thread Management', () => {
    describe('getThreads', () => {
      it('should fetch all threads without filter', async () => {
        const mockThreads: MessageThread[] = [
          {
            id: 1,
            participants: [
              { userId: 1, name: 'John Client', role: 'CLIENT' },
              { userId: 2, name: 'Jane Employee', role: 'EMPLOYEE' },
            ],
            subject: 'Investment Discussion',
            lastMessage: {
              content: 'Thanks for the update',
              senderId: 1,
              createdAt: '2024-12-15T10:00:00Z',
            },
            unreadCount: 0,
            totalMessages: 5,
            createdAt: '2024-12-14T10:00:00Z',
            updatedAt: '2024-12-15T10:00:00Z',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockThreads });

        const result = await messageService.getThreads();

        expect(apiClient.get).toHaveBeenCalledWith('/messages/threads', { params: undefined });
        expect(result).toEqual(mockThreads);
      });

      it('should fetch threads with filter', async () => {
        const mockThreads: MessageThread[] = [];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockThreads });

        await messageService.getThreads('inbox');

        expect(apiClient.get).toHaveBeenCalledWith('/messages/threads', { 
          params: { filter: 'inbox' } 
        });
      });
    });

    describe('getThread', () => {
      it('should fetch single thread', async () => {
        const threadId = 1;
        const mockThread: MessageThread = {
          id: threadId,
          participants: [
            { userId: 1, name: 'John Client', role: 'CLIENT' },
            { userId: 2, name: 'Jane Employee', role: 'EMPLOYEE' },
          ],
          subject: 'Portfolio Review',
          lastMessage: {
            content: 'Looking forward to our meeting',
            senderId: 2,
            createdAt: '2024-12-15T14:00:00Z',
          },
          unreadCount: 1,
          totalMessages: 10,
          createdAt: '2024-12-10T10:00:00Z',
          updatedAt: '2024-12-15T14:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockThread });

        const result = await messageService.getThread(threadId);

        expect(apiClient.get).toHaveBeenCalledWith(`/messages/threads/${threadId}`);
        expect(result).toEqual(mockThread);
      });
    });

    describe('searchThreads', () => {
      it('should search threads', async () => {
        const query = 'portfolio';
        const mockResults: MessageThread[] = [];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResults });

        const result = await messageService.searchThreads(query);

        expect(apiClient.get).toHaveBeenCalledWith('/messages/search', {
          params: { q: query },
        });
        expect(result).toEqual(mockResults);
      });
    });
  });

  describe('Message Operations', () => {
    describe('sendMessage', () => {
      it('should send new message', async () => {
        const request: CreateMessageRequest = {
          recipientId: 2,
          subject: 'Quarterly Update',
          content: 'Here is your quarterly portfolio update.',
          priority: 'NORMAL',
        };

        const mockResponse: MessageDTO = {
          id: 100,
          threadId: 10,
          senderId: 1,
          senderName: 'John Client',
          senderRole: 'CLIENT',
          recipientId: 2,
          recipientName: 'Jane Employee',
          recipientRole: 'EMPLOYEE',
          subject: request.subject,
          content: request.content,
          status: 'UNREAD',
          priority: 'NORMAL',
          createdAt: '2024-12-15T15:00:00Z',
          attachments: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await messageService.sendMessage(request);

        expect(apiClient.post).toHaveBeenCalledWith('/messages', request);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('replyToMessage', () => {
      it('should reply to message', async () => {
        const threadId = 10;
        const request = {
          subject: 'Re: Quarterly Update',
          content: 'Thank you for the update.',
          priority: 'NORMAL' as const,
        };

        const mockResponse: MessageDTO = {
          id: 101,
          threadId,
          senderId: 2,
          senderName: 'Jane Employee',
          senderRole: 'EMPLOYEE',
          recipientId: 1,
          recipientName: 'John Client',
          recipientRole: 'CLIENT',
          subject: request.subject,
          content: request.content,
          status: 'UNREAD',
          priority: 'NORMAL',
          createdAt: '2024-12-15T16:00:00Z',
          attachments: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await messageService.replyToMessage(threadId, request);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/messages/threads/${threadId}/reply`,
          request
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateMessageStatus', () => {
      it('should update message status', async () => {
        const messageId = 100;
        const status = 'ARCHIVED';

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: {} });

        await messageService.updateMessageStatus(messageId, status);

        expect(apiClient.put).toHaveBeenCalledWith(`/messages/${messageId}/status`, { status });
      });
    });

    describe('markAsRead', () => {
      it('should mark message as read', async () => {
        const messageId = 100;

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: {} });

        await messageService.markAsRead(messageId);

        expect(apiClient.put).toHaveBeenCalledWith(`/messages/${messageId}/status`, {
          status: 'READ',
        });
      });
    });

    describe('archiveMessage', () => {
      it('should archive message', async () => {
        const messageId = 100;

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: {} });

        await messageService.archiveMessage(messageId);

        expect(apiClient.put).toHaveBeenCalledWith(`/messages/${messageId}/status`, {
          status: 'ARCHIVED',
        });
      });
    });

    describe('deleteMessage', () => {
      it('should delete message', async () => {
        const messageId = 100;

        vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

        await messageService.deleteMessage(messageId);

        expect(apiClient.delete).toHaveBeenCalledWith(`/messages/${messageId}`);
      });
    });

    describe('bulkUpdateStatus', () => {
      it('should bulk update message status', async () => {
        const messageIds = [1, 2, 3];
        const status = 'READ';

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: {} });

        await messageService.bulkUpdateStatus(messageIds, status);

        expect(apiClient.put).toHaveBeenCalledWith('/messages/bulk-status', {
          messageIds,
          status,
        });
      });
    });
  });

  describe('Notifications', () => {
    describe('getUnreadCount', () => {
      it('should fetch unread count', async () => {
        const mockResponse = { count: 5 };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

        const result = await messageService.getUnreadCount();

        expect(apiClient.get).toHaveBeenCalledWith('/messages/unread-count');
        expect(result).toBe(5);
      });
    });

    describe('getNotifications', () => {
      it('should fetch notifications with default limit', async () => {
        const mockNotifications: MessageNotification[] = [
          {
            messageId: 1,
            threadId: 10,
            senderName: 'John Client',
            subject: 'New Message',
            preview: 'I have a question about...',
            priority: 'HIGH',
            receivedAt: '2024-12-15T17:00:00Z',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotifications });

        const result = await messageService.getNotifications();

        expect(apiClient.get).toHaveBeenCalledWith('/messages/notifications', {
          params: { limit: 10 },
        });
        expect(result).toEqual(mockNotifications);
      });

      it('should fetch notifications with custom limit', async () => {
        const mockNotifications: MessageNotification[] = [];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotifications });

        await messageService.getNotifications(5);

        expect(apiClient.get).toHaveBeenCalledWith('/messages/notifications', {
          params: { limit: 5 },
        });
      });
    });
  });

  describe('Recipients', () => {
    describe('getRecipients', () => {
      it('should fetch available recipients', async () => {
        const mockRecipients = [
          { id: 1, name: 'Jane Employee', role: 'EMPLOYEE' },
          { id: 2, name: 'Admin User', role: 'ADMIN' },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecipients });

        const result = await messageService.getRecipients();

        expect(apiClient.get).toHaveBeenCalledWith('/messages/recipients');
        expect(result).toEqual(mockRecipients);
      });
    });

    describe('searchRecipients', () => {
      it('should search recipients', async () => {
        const query = 'jane';
        const mockResults = [{ id: 1, name: 'Jane Employee', role: 'EMPLOYEE' }];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResults });

        const result = await messageService.searchRecipients(query);

        expect(apiClient.get).toHaveBeenCalledWith('/messages/recipients/search', {
          params: { q: query },
        });
        expect(result).toEqual(mockResults);
      });
    });
  });

  describe('Drafts', () => {
    describe('saveDraft', () => {
      it('should save draft', async () => {
        const draft: Partial<CreateMessageRequest> = {
          recipientId: 2,
          subject: 'Draft Message',
          content: 'This is a draft',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { draftId: 10 } });

        const result = await messageService.saveDraft(draft);

        expect(apiClient.post).toHaveBeenCalledWith('/messages/drafts', draft);
        expect(result).toBe(10);
      });
    });

    describe('getDrafts', () => {
      it('should fetch drafts', async () => {
        const mockDrafts = [
          {
            id: 1,
            recipientId: 2,
            subject: 'Draft 1',
            content: 'Draft content',
            priority: 'NORMAL' as const,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDrafts });

        const result = await messageService.getDrafts();

        expect(apiClient.get).toHaveBeenCalledWith('/messages/drafts');
        expect(result).toEqual(mockDrafts);
      });
    });

    describe('deleteDraft', () => {
      it('should delete draft', async () => {
        const draftId = 10;

        vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

        await messageService.deleteDraft(draftId);

        expect(apiClient.delete).toHaveBeenCalledWith(`/messages/drafts/${draftId}`);
      });
    });
  });
});
