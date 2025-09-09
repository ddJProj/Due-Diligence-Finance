// frontend/src/pages/shared/ComposeMessagePage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { messageService } from '@/api/MessageService';
import {
  Button,
  LoadingSpinner,
  ErrorMessage,
  ConfirmDialog,
  Badge,
} from '@/components/common';
import type { CreateMessageRequest, MessagePriority } from '@/types';
import './ComposeMessagePage.css';

interface Recipient {
  id: number;
  name: string;
  role: string;
}

interface Draft extends CreateMessageRequest {
  id: number;
}

const ComposeMessagePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  const formRef = useRef<HTMLFormElement>(null);
  
  // State
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  
  // Form state
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('NORMAL');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Auto-save draft timer
  const draftTimerRef = useRef<NodeJS.Timeout>();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [recipientData, draftData] = await Promise.all([
          messageService.getRecipients(),
          messageService.getDrafts(),
        ]);
        setRecipients(recipientData);
        setDrafts(draftData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter recipients based on search
  useEffect(() => {
    if (recipientSearch.trim()) {
      messageService.searchRecipients(recipientSearch).then(results => {
        setFilteredRecipients(results);
      });
    } else {
      setFilteredRecipients(recipients);
    }
  }, [recipientSearch, recipients]);

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!selectedRecipient || (!subject.trim() && !content.trim())) return;
    
    setSavingDraft(true);
    try {
      const draftData: Partial<CreateMessageRequest> = {
        recipientId: selectedRecipient.id,
        subject: subject.trim(),
        content: content.trim(),
        priority,
      };
      
      if (currentDraftId) {
        // Update existing draft
        await messageService.deleteDraft(currentDraftId);
      }
      
      const newDraftId = await messageService.saveDraft(draftData);
      setCurrentDraftId(newDraftId);
      
      // Reload drafts
      const updatedDrafts = await messageService.getDrafts();
      setDrafts(updatedDrafts);
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setSavingDraft(false);
    }
  }, [selectedRecipient, subject, content, priority, currentDraftId]);

  // Handle form changes with auto-save
  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
    setValidationErrors({});
    
    // Clear existing timer
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }
    
    // Set new timer for draft saving
    if (selectedRecipient && (subject.trim() || content.trim())) {
      draftTimerRef.current = setTimeout(() => {
        saveDraft();
      }, 2000); // Save after 2 seconds of inactivity
    }
  }, [selectedRecipient, subject, content, saveDraft]);

  // Handle recipient selection
  const handleRecipientSelect = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setRecipientSearch(recipient.name);
    setShowRecipientDropdown(false);
    handleFormChange();
  };

  // Load draft
  const handleLoadDraft = (draft: Draft) => {
    const recipient = recipients.find(r => r.id === draft.recipientId);
    if (recipient) {
      setSelectedRecipient(recipient);
      setRecipientSearch(recipient.name);
    }
    setSubject(draft.subject);
    setContent(draft.content);
    setPriority(draft.priority);
    setCurrentDraftId(draft.id);
    setHasUnsavedChanges(false);
  };

  // Delete draft
  const handleDeleteDraft = async (draftId: number) => {
    try {
      await messageService.deleteDraft(draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
      if (currentDraftId === draftId) {
        setCurrentDraftId(null);
      }
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedRecipient) {
      errors.recipient = 'Recipient is required';
    }
    
    if (!subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!content.trim()) {
      errors.content = 'Message content is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send message
  const handleSend = async () => {
    if (!validateForm()) return;
    
    setSending(true);
    setError(null);
    
    try {
      const messageRequest: CreateMessageRequest = {
        recipientId: selectedRecipient!.id,
        subject: subject.trim(),
        content: content.trim(),
        priority,
      };
      
      await messageService.sendMessage(messageRequest);
      
      // Delete draft if it was saved
      if (currentDraftId) {
        await messageService.deleteDraft(currentDraftId);
      }
      
      // Navigate back to messages
      navigate('/messages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      navigate('/messages');
    }
  };

  const confirmCancel = () => {
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="compose-message-page">
        <LoadingSpinner size="large" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="compose-message-page">
      <div className="compose-header">
        <h1>Compose Message</h1>
        <div className="header-actions">
          {savingDraft && (
            <span className="draft-status">Saving draft...</span>
          )}
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="compose-content">
        <form ref={formRef} className="compose-form">
          {/* Recipient field */}
          <div className="form-group">
            <label htmlFor="recipient">
              Recipient <span className="required">*</span>
            </label>
            <div className="recipient-field">
              <input
                type="text"
                id="recipient"
                value={recipientSearch}
                onChange={(e) => {
                  setRecipientSearch(e.target.value);
                  setShowRecipientDropdown(true);
                  handleFormChange();
                }}
                onFocus={() => setShowRecipientDropdown(true)}
                onBlur={() => setTimeout(() => setShowRecipientDropdown(false), 200)}
                placeholder="Search for recipient..."
                className={validationErrors.recipient ? 'error' : ''}
              />
              
              {showRecipientDropdown && filteredRecipients.length > 0 && (
                <div className="recipient-dropdown">
                  {filteredRecipients.map(recipient => (
                    <div
                      key={recipient.id}
                      className="recipient-option"
                      onClick={() => handleRecipientSelect(recipient)}
                    >
                      <span className="recipient-name">{recipient.name}</span>
                      <Badge variant="secondary" size="small">
                        {recipient.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {validationErrors.recipient && (
              <span className="error-message">{validationErrors.recipient}</span>
            )}
          </div>

          {/* Subject field */}
          <div className="form-group">
            <label htmlFor="subject">
              Subject <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                handleFormChange();
              }}
              placeholder="Enter message subject..."
              className={validationErrors.subject ? 'error' : ''}
            />
            {validationErrors.subject && (
              <span className="error-message">{validationErrors.subject}</span>
            )}
          </div>

          {/* Priority field */}
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as MessagePriority);
                handleFormChange();
              }}
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Message content */}
          <div className="form-group">
            <label htmlFor="message">
              Message <span className="required">*</span>
            </label>
            <textarea
              id="message"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleFormChange();
              }}
              placeholder="Type your message..."
              rows={10}
              className={validationErrors.content ? 'error' : ''}
            />
            {validationErrors.content && (
              <span className="error-message">{validationErrors.content}</span>
            )}
          </div>

          {/* Error message */}
          {error && (
            <ErrorMessage message="Failed to send message" details={error} />
          )}

          {/* Send button */}
          <div className="form-actions">
            <Button
              variant="primary"
              size="large"
              onClick={handleSend}
              disabled={sending}
              loading={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>

        {/* Drafts section */}
        {drafts.length > 0 && (
          <div className="drafts-section">
            <h2>Saved Drafts</h2>
            <div className="drafts-list">
              {drafts.map(draft => {
                const recipient = recipients.find(r => r.id === draft.recipientId);
                return (
                  <div key={draft.id} className="draft-item">
                    <div
                      className="draft-content"
                      onClick={() => handleLoadDraft(draft)}
                    >
                      <h3>{draft.subject || 'No subject'}</h3>
                      <p>{recipient ? `To: ${recipient.name}` : 'Unknown recipient'}</p>
                      <p className="draft-preview">
                        {draft.content.substring(0, 100)}
                        {draft.content.length > 100 && '...'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(draft.id);
                      }}
                      aria-label="Delete draft"
                    >
                      Delete draft
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
        variant="warning"
      />
    </div>
  );
};

export default ComposeMessagePage;
