// frontend/src/pages/shared/MessageThreadPage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { messageService } from '@/api/MessageService';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Badge,
  ConfirmDialog,
} from '@/components/common';
import type { MessageThread, MessageDTO, MessagePriority } from '@/types';
import './MessageThreadPage.css';

interface ThreadWithMessages extends MessageThread {
  messages: MessageDTO[];
}

const MessageThreadPage: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  
  // State
  const [thread, setThread] = useState<ThreadWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  // Auto-save draft timer
  const draftTimerRef = useRef<NodeJS.Timeout>();

  // Fetch thread data
  const fetchThread = useCallback(async () => {
    if (!threadId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getThread(parseInt(threadId));
      setThread(data as ThreadWithMessages);
      
      // Mark unread messages as read
      if (data.messages) {
        const unreadMessages = data.messages.filter(
          msg => msg.recipientId === currentUser?.id && msg.status === 'UNREAD'
        );
        
        for (const msg of unreadMessages) {
          await messageService.markAsRead(msg.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [threadId, currentUser?.id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  // Save draft
  const saveDraft = useCallback(async (content: string) => {
    if (!thread || !content.trim()) return;
    
    const otherParticipant = thread.participants.find(
      p => p.userId !== currentUser?.id
    );
    
    if (!otherParticipant) return;
    
    setSavingDraft(true);
    try {
      const savedDraftId = await messageService.saveDraft({
        recipientId: otherParticipant.userId,
        subject: `Re: ${thread.subject}`,
        content,
        priority: 'NORMAL',
      });
      setDraftId(savedDraftId);
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSavingDraft(false);
    }
  }, [thread, currentUser?.id]);

  // Handle reply input change with draft saving
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setReplyContent(content);
    
    // Clear existing timer
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }
    
    // Set new timer for draft saving
    if (content.trim()) {
      draftTimerRef.current = setTimeout(() => {
        saveDraft(content);
      }, 1500); // Save after 1.5 seconds of inactivity
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!thread || !replyContent.trim() || sendingReply) return;
    
    setSendingReply(true);
    try {
      await messageService.replyToMessage(thread.id, {
        subject: `Re: ${thread.subject}`,
        content: replyContent.trim(),
        priority: 'NORMAL',
      });
      
      // Clear draft if it was saved
      if (draftId) {
        await messageService.deleteDraft(draftId);
        setDraftId(null);
      }
      
      setReplyContent('');
      await fetchThread(); // Refresh thread
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Archive thread
  const handleArchive = async () => {
    if (!thread) return;
    
    try {
      // Archive all messages in thread
      for (const msg of thread.messages) {
        if (msg.recipientId === currentUser?.id) {
          await messageService.archiveMessage(msg.id);
        }
      }
      navigate('/messages');
    } catch (err) {
      console.error('Failed to archive thread:', err);
    }
  };

  // Delete thread
  const handleDelete = async () => {
    if (!thread) return;
    
    try {
      // Delete all messages in thread
      for (const msg of thread.messages) {
        if (msg.recipientId === currentUser?.id) {
          await messageService.deleteMessage(msg.id);
        }
      }
      navigate('/messages');
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get other participant
  const getOtherParticipant = () => {
    if (!thread) return null;
    return thread.participants.find(p => p.userId !== currentUser?.id);
  };

  if (loading) {
    return (
      <div className="message-thread-page">
        <LoadingSpinner size="large" message="Loading conversation..." />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="message-thread-page">
        <ErrorMessage
          message="Failed to load conversation"
          details={error || 'Thread not found'}
          onRetry={fetchThread}
        />
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="message-thread-page">
      <div className="thread-header">
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate('/messages')}
          icon="arrow-left"
        >
          Back
        </Button>
        
        <div className="thread-info">
          <h1>{thread.subject}</h1>
          {otherParticipant && (
            <div className="participant-info">
              <span>{otherParticipant.name}</span>
              <Badge variant="secondary" size="small">
                {otherParticipant.role}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="thread-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => setArchiveConfirm(true)}
          >
            Archive conversation
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete conversation
          </Button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {thread.messages.map((message, index) => {
            const isOwn = message.senderId === currentUser?.id;
            const showDate = index === 0 || 
              new Date(message.createdAt).toDateString() !== 
              new Date(thread.messages[index - 1].createdAt).toDateString();
            
            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="date-separator">
                    <span>{formatDate(message.createdAt).split(',')[0]}</span>
                  </div>
                )}
                
                <div className={`message ${isOwn ? 'own' : 'other'}`}>
                  <div className="message-header">
                    <span className="sender-name">{message.senderName}</span>
                    {message.priority !== 'NORMAL' && (
                      <Badge 
                        variant={message.priority === 'HIGH' ? 'warning' : 'danger'} 
                        size="small"
                      >
                        {message.priority}
                      </Badge>
                    )}
                    <time className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  
                  <div className="message-content">{message.content}</div>
                  
                  {message.attachments.length > 0 && (
                    <div className="message-attachments">
                      {message.attachments.map(attachment => (
                        <div key={attachment.id} className="attachment">
                          <span className="attachment-icon">📎</span>
                          <span className="attachment-name">{attachment.filename}</span>
                          <span className="attachment-size">
                            {formatFileSize(attachment.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="reply-section">
          <textarea
            ref={replyInputRef}
            value={replyContent}
            onChange={handleReplyChange}
            placeholder="Type your message..."
            className="reply-input"
            rows={3}
          />
          
          <div className="reply-actions">
            {savingDraft && (
              <span className="draft-status">Saving draft...</span>
            )}
            <Button
              variant="primary"
              onClick={handleSendReply}
              disabled={!replyContent.trim() || sendingReply}
              loading={sendingReply}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={archiveConfirm}
        onClose={() => setArchiveConfirm(false)}
        onConfirm={handleArchive}
        title="Archive Conversation"
        message="Are you sure you want to archive this conversation? You can find it in the Archived tab."
        confirmText="Archive"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default MessageThreadPage;
