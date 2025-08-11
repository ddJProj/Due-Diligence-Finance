// frontend/src/types/message.types.ts

import { Role } from './common.types';

export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED';
export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface MessageDTO {
  id: number;
  threadId: number;
  senderId: number;
  senderName: string;
  senderRole: Role;
  recipientId: number;
  recipientName: string;
  recipientRole: Role;
  subject: string;
  content: string;
  status: MessageStatus;
  priority: MessagePriority;
  createdAt: string;
  readAt?: string;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: number;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface CreateMessageRequest {
  recipientId: number;
  subject: string;
  content: string;
  priority: MessagePriority;
  replyToMessageId?: number;
}

export interface MessageThread {
  id: number;
  participants: MessageParticipant[];
  subject: string;
  lastMessage: {
    content: string;
    senderId: number;
    createdAt: string;
  };
  unreadCount: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageParticipant {
  userId: number;
  name: string;
  role: Role;
}

export interface MessageNotification {
  messageId: number;
  threadId: number;
  senderName: string;
  subject: string;
  preview: string;
  priority: MessagePriority;
  receivedAt: string;
}
