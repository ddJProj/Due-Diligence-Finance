// frontend/src/pages/shared/MessagesPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { messageService } from '@/api/MessageService';
import {
  LoadingSpinner,
  ErrorMessage,
  SearchInput,
  Badge,
  Button,
  ConfirmDialog,
} from '@/components/common';
import type { MessageThread, MessageStatus } from '@/types';
import './MessagesPage.css';

type FilterTab = 'inbox' | 'sent' | 'archived';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  
  // State
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThreads, setSelectedThreads] = useState<Set<number>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [threadData, count] = await Promise.all([
        activeTab === 'inbox' ? messageService.getThreads() : messageService.getThreads(activeTab),
        messageService.getUnreadCount(),
      ]);
      
      setThreads(threadData);
      setUnreadCount(count);
      
      // Apply search filter if active
      if (searchQuery) {
        const results = await messageService.searchThreads(searchQuery);
        setFilteredThreads(results);
      } else {
        setFilteredThreads(threadData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Search handling
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await messageService.searchThreads(query);
        setFilteredThreads(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      setFilteredThreads(threads);
    }
  }, [threads]);

  // Tab change
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setSelectedThreads(new Set());
    setSearchQuery('');
  };

  // Thread selection
  const handleSelectThread = (threadId: number) => {
    const newSelection = new Set(selectedThreads);
    if (newSelection.has(threadId)) {
      newSelection.delete(threadId);
    } else {
      newSelection.add(threadId);
    }
    setSelectedThreads(newSelection);
  };

  // Bulk actions
  const handleBulkAction = async (action: 'read' | 'unread' | 'archive') => {
    try {
      const statusMap: Record<string, MessageStatus> = {
        read: 'READ',
        unread: 'UNREAD',
        archive: 'ARCHIVED',
      };
      
      await messageService.bulkUpdateStatus(
        Array.from(selectedThreads),
        statusMap[action]
      );
      
      setSelectedThreads(new Set());
      await fetchMessages();
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  // Archive thread
  const handleArchive = async (threadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Archive the last message in the thread
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        await messageService.updateMessageStatus(threadId, 'ARCHIVED');
        await fetchMessages();
      }
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  // Delete thread
  const handleDelete = async (threadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(threadId);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await messageService.deleteMessage(deleteConfirmId);
        setDeleteConfirmId(null);
        await fetchMessages();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  // Navigate to thread
  const handleThreadClick = (threadId: number) => {
    navigate(`/messages/${threadId}`);
  };

  // Get other participant name
  const getOtherParticipant = (thread: MessageThread) => {
    const otherParticipant = thread.participants.find(
      p => p.userId !== currentUser?.id
    );
    return otherParticipant || thread.participants[0];
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <LoadingSpinner size="large" message="Loading messages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <ErrorMessage
          message="Failed to load messages"
          details={error}
          onRetry={fetchMessages}
        />
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>Messages</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/messages/compose')}
          icon="plus"
        >
          Compose
        </Button>
      </div>

      <div className="messages-controls">
        <SearchInput
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search messages..."
          className="messages-search"
        />
      </div>

      <div className="messages-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'inbox'}
          className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => handleTabChange('inbox')}
        >
          Inbox
          {unreadCount > 0 && (
            <Badge variant="primary" className="tab-badge">
              {unreadCount}
            </Badge>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'sent'}
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => handleTabChange('sent')}
        >
          Sent
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'archived'}
          className={`tab ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => handleTabChange('archived')}
        >
          Archived
        </button>
      </div>

      {selectedThreads.size > 0 && (
        <div className="bulk-actions">
          <span>{selectedThreads.size} selected</span>
          <div className="bulk-actions-buttons">
            <Button
              size="small"
              variant="secondary"
              onClick={() => handleBulkAction('read')}
            >
              Mark as read
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => handleBulkAction('unread')}
            >
              Mark as unread
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => handleBulkAction('archive')}
            >
              Archive
            </Button>
          </div>
        </div>
      )}

      <div className="messages-list">
        {filteredThreads.length === 0 ? (
          <div className="empty-state">
            <p>No messages</p>
            <p className="empty-state-hint">Start a conversation with your advisor</p>
          </div>
        ) : (
          filteredThreads.map(thread => {
            const otherParticipant = getOtherParticipant(thread);
            const isUnread = thread.unreadCount > 0;
            
            return (
              <article
                key={thread.id}
                className={`message-thread ${isUnread ? 'unread' : ''} ${
                  selectedThreads.has(thread.id) ? 'selected' : ''
                }`}
                onClick={() => handleThreadClick(thread.id)}
                role="article"
              >
                <div className="thread-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedThreads.has(thread.id)}
                    onChange={() => handleSelectThread(thread.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select thread ${thread.subject}`}
                  />
                </div>
                
                <div className="thread-content">
                  <div className="thread-header">
                    <div className="thread-info">
                      <h3 className="thread-subject">{thread.subject}</h3>
                      <span className="thread-participant">
                        {otherParticipant.name}
                        <Badge variant="secondary" size="small">
                          {otherParticipant.role}
                        </Badge>
                      </span>
                    </div>
                    <div className="thread-meta">
                      {isUnread && (
                        <Badge variant="primary" size="small">
                          {thread.unreadCount}
                        </Badge>
                      )}
                      <time className="thread-time">
                        {formatDate(thread.lastMessage.createdAt)}
                      </time>
                    </div>
                  </div>
                  
                  <p className="thread-preview">{thread.lastMessage.content}</p>
                  
                  <div className="thread-actions">
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={(e) => handleArchive(thread.id, e)}
                      aria-label="Archive message"
                    >
                      Archive
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={(e) => handleDelete(thread.id, e)}
                      aria-label="Delete message"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message thread? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default MessagesPage;
