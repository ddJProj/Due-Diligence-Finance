// frontend/src/types/message.types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  MessageDTO,
  CreateMessageRequest,
  MessageThread,
  MessageNotification,
  MessageStatus,
  MessagePriority,
} from './message.types';

describe('Message Types', () => {
  describe('MessageDTO', () => {
    it('should have correct structure for message data', () => {
      const validMessage: MessageDTO = {
        id: 1,
        threadId: 100,
        senderId: 50,
        senderName: 'Jane Employee',
        senderRole: 'EMPLOYEE',
        recipientId: 150,
        recipientName: 'John Client',
        recipientRole: 'CLIENT',
        subject: 'Portfolio Update',
        content: 'Your portfolio has been updated with new investment recommendations.',
        status: 'READ',
        priority: 'NORMAL',
        createdAt: '2024-12-15T10:00:00Z',
        readAt: '2024-12-15T14:30:00Z',
        attachments: [],
      };

      expect(validMessage.id).toBe(1);
      expect(validMessage.senderRole).toBe('EMPLOYEE');
      expect(validMessage.recipientRole).toBe('CLIENT');
      expect(validMessage.status).toBe('READ');
      expect(validMessage.priority).toBe('NORMAL');
    });

    it('should support unread messages with attachments', () => {
      const unreadMessage: MessageDTO = {
        id: 2,
        threadId: 100,
        senderId: 150,
        senderName: 'John Client',
        senderRole: 'CLIENT',
        recipientId: 50,
        recipientName: 'Jane Employee',
        recipientRole: 'EMPLOYEE',
        subject: 'Question about investments',
        content: 'I have a question about my recent investment performance.',
        status: 'UNREAD',
        priority: 'HIGH',
        createdAt: '2024-12-15T15:00:00Z',
        attachments: [
          {
            id: 1,
            filename: 'portfolio-report.pdf',
            size: 245678,
            mimeType: 'application/pdf',
            uploadedAt: '2024-12-15T15:00:00Z',
          },
        ],
      };

      expect(unreadMessage.status).toBe('UNREAD');
      expect(unreadMessage.readAt).toBeUndefined();
      expect(unreadMessage.attachments).toHaveLength(1);
      expect(unreadMessage.attachments[0].filename).toBe('portfolio-report.pdf');
    });
  });

  describe('CreateMessageRequest', () => {
    it('should have correct structure for creating message', () => {
      const validRequest: CreateMessageRequest = {
        recipientId: 150,
        subject: 'Monthly Portfolio Review',
        content: 'Please find attached your monthly portfolio review.',
        priority: 'NORMAL',
        replyToMessageId: undefined,
      };

      expect(validRequest.recipientId).toBe(150);
      expect(validRequest.subject).toBe('Monthly Portfolio Review');
      expect(validRequest.priority).toBe('NORMAL');
    });

    it('should support reply messages', () => {
      const replyRequest: CreateMessageRequest = {
        recipientId: 50,
        subject: 'Re: Monthly Portfolio Review',
        content: 'Thank you for the review. I have some questions.',
        priority: 'NORMAL',
        replyToMessageId: 1,
      };

      expect(replyRequest.replyToMessageId).toBe(1);
    });
  });

  describe('MessageThread', () => {
    it('should have correct structure for message thread', () => {
      const validThread: MessageThread = {
        id: 100,
        participants: [
          {
            userId: 50,
            name: 'Jane Employee',
            role: 'EMPLOYEE',
          },
          {
            userId: 150,
            name: 'John Client',
            role: 'CLIENT',
          },
        ],
        subject: 'Portfolio Update Discussion',
        lastMessage: {
          content: 'Thank you for the clarification.',
          senderId: 150,
          createdAt: '2024-12-15T16:00:00Z',
        },
        unreadCount: 0,
        totalMessages: 5,
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-15T16:00:00Z',
      };

      expect(validThread.participants).toHaveLength(2);
      expect(validThread.totalMessages).toBe(5);
      expect(validThread.unreadCount).toBe(0);
    });
  });

  describe('MessageNotification', () => {
    it('should have correct structure for notifications', () => {
      const validNotification: MessageNotification = {
        messageId: 3,
        threadId: 101,
        senderName: 'Alice Admin',
        subject: 'System Maintenance Notice',
        preview: 'The system will undergo maintenance...',
        priority: 'HIGH',
        receivedAt: '2024-12-15T17:00:00Z',
      };

      expect(validNotification.messageId).toBe(3);
      expect(validNotification.priority).toBe('HIGH');
      expect(validNotification.preview).toContain('maintenance');
    });
  });

  describe('Message Enums', () => {
    it('should have correct message status values', () => {
      const statuses: MessageStatus[] = ['UNREAD', 'READ', 'ARCHIVED', 'DELETED'];
      
      statuses.forEach(status => {
        expect(['UNREAD', 'READ', 'ARCHIVED', 'DELETED']).toContain(status);
      });
    });

    it('should have correct message priority values', () => {
      const priorities: MessagePriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
      
      priorities.forEach(priority => {
        expect(['LOW', 'NORMAL', 'HIGH', 'URGENT']).toContain(priority);
      });
    });
  });
});
