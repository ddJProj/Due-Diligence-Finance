// frontend/src/api/MessageService.ts

import { apiClient } from './apiClient';
import {
  MessageDTO,
  MessageThread,
  CreateMessageRequest,
  MessageStatus,
  MessageNotification,
} from '@/types';

/**
 * Service for managing messages across all roles
 * Provides unified messaging functionality
 */
export class MessageService {
  private static instance: MessageService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // Thread Management
  // =================

  /**
   * Get all message threads
   * @param filter - Optional filter (inbox, sent, archived)
   * @returns List of message threads
   */
  public async getThreads(filter?: 'inbox' | 'sent' | 'archived'): Promise<MessageThread[]> {
    const response = await apiClient.get<MessageThread[]>('/messages/threads', {
      params: filter ? { filter } : undefined,
    });
    return response.data;
  }

  /**
   * Get a specific thread with all messages
   * @param threadId - Thread ID
   * @returns Thread with messages
   */
  public async getThread(threadId: number): Promise<MessageThread> {
    const response = await apiClient.get<MessageThread>(`/messages/threads/${threadId}`);
    return response.data;
  }

  /**
   * Search message threads
   * @param query - Search query
   * @returns Matching threads
   */
  public async searchThreads(query: string): Promise<MessageThread[]> {
    const response = await apiClient.get<MessageThread[]>('/messages/search', {
      params: { q: query },
    });
    return response.data;
  }

  // Message Operations
  // ==================

  /**
   * Send a new message
   * @param request - Message request
   * @returns Created message
   */
  public async sendMessage(request: CreateMessageRequest): Promise<MessageDTO> {
    const response = await apiClient.post<MessageDTO>('/messages', request);
    return response.data;
  }

  /**
   * Reply to a message
   * @param threadId - Thread ID
   * @param request - Reply request
   * @returns Created reply
   */
  public async replyToMessage(
    threadId: number,
    request: Omit<CreateMessageRequest, 'recipientId'>
  ): Promise<MessageDTO> {
    const response = await apiClient.post<MessageDTO>(`/messages/threads/${threadId}/reply`, request);
    return response.data;
  }

  /**
   * Update message status
   * @param messageId - Message ID
   * @param status - New status
   */
  public async updateMessageStatus(messageId: number, status: MessageStatus): Promise<void> {
    await apiClient.put(`/messages/${messageId}/status`, { status });
  }

  /**
   * Mark message as read
   * @param messageId - Message ID
   */
  public async markAsRead(messageId: number): Promise<void> {
    await this.updateMessageStatus(messageId, 'READ');
  }

  /**
   * Archive message
   * @param messageId - Message ID
   */
  public async archiveMessage(messageId: number): Promise<void> {
    await this.updateMessageStatus(messageId, 'ARCHIVED');
  }

  /**
   * Delete message
   * @param messageId - Message ID
   */
  public async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  }

  /**
   * Bulk update message status
   * @param messageIds - Array of message IDs
   * @param status - New status
   */
  public async bulkUpdateStatus(messageIds: number[], status: MessageStatus): Promise<void> {
    await apiClient.put('/messages/bulk-status', { messageIds, status });
  }

  // Notifications
  // =============

  /**
   * Get unread message count
   * @returns Unread count
   */
  public async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/messages/unread-count');
    return response.data.count;
  }

  /**
   * Get recent message notifications
   * @param limit - Number of notifications
   * @returns Recent notifications
   */
  public async getNotifications(limit: number = 10): Promise<MessageNotification[]> {
    const response = await apiClient.get<MessageNotification[]>('/messages/notifications', {
      params: { limit },
    });
    return response.data;
  }

  // Recipients
  // ==========

  /**
   * Get available recipients
   * @returns List of possible recipients
   */
  public async getRecipients(): Promise<Array<{ id: number; name: string; role: string }>> {
    const response = await apiClient.get<Array<{ id: number; name: string; role: string }>>(
      '/messages/recipients'
    );
    return response.data;
  }

  /**
   * Search recipients
   * @param query - Search query
   * @returns Matching recipients
   */
  public async searchRecipients(
    query: string
  ): Promise<Array<{ id: number; name: string; role: string }>> {
    const response = await apiClient.get<Array<{ id: number; name: string; role: string }>>(
      '/messages/recipients/search',
      { params: { q: query } }
    );
    return response.data;
  }

  // Drafts
  // ======

  /**
   * Save message draft
   * @param draft - Draft message
   * @returns Draft ID
   */
  public async saveDraft(draft: Partial<CreateMessageRequest>): Promise<number> {
    const response = await apiClient.post<{ draftId: number }>('/messages/drafts', draft);
    return response.data.draftId;
  }

  /**
   * Get drafts
   * @returns List of drafts
   */
  public async getDrafts(): Promise<Array<CreateMessageRequest & { id: number }>> {
    const response = await apiClient.get<Array<CreateMessageRequest & { id: number }>>(
      '/messages/drafts'
    );
    return response.data;
  }

  /**
   * Delete draft
   * @param draftId - Draft ID
   */
  public async deleteDraft(draftId: number): Promise<void> {
    await apiClient.delete(`/messages/drafts/${draftId}`);
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();
