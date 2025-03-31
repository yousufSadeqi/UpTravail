'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, FileText, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { messagesService, Message, Conversation, ConversationParticipant } from '@/lib/services/messages';
import { useDebounce } from '@/hooks/useDebounce';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export default function MessagesSection() {
  const { user } = useAuth() as { user: AuthUser | null };
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<File[]>([]);
  const debouncedMessage = useDebounce(newMessage, 500);

  useEffect(() => {
    if (!user) return;

    // Load initial conversations
    const loadConversations = async () => {
      try {
        const data = await messagesService.getConversations(user.id);
        setConversations(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();

    // Subscribe to conversation updates
    const subscription = messagesService.subscribeToConversations(
      user.id,
      (updatedConversation) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    // Load messages for selected conversation
    const loadMessages = async () => {
      try {
        const data = await messagesService.getMessages(selectedConversation.id);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = messagesService.subscribeToMessages(
      selectedConversation.id,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation]);

  // Effect for handling typing status
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const isUserTyping = debouncedMessage.length > 0;
    if (isTyping !== isUserTyping) {
      messagesService.updateTypingStatus({
        conversation_id: selectedConversation.id,
        user_id: user.id,
        is_typing: isUserTyping
      });
      setIsTyping(isUserTyping);
    }
  }, [debouncedMessage, selectedConversation, user]);

  // Subscribe to typing status
  useEffect(() => {
    if (!selectedConversation) return;

    const subscription = messagesService.subscribeToTypingStatus(
      selectedConversation.id,
      (status) => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          if (status.is_typing) {
            next.add(status.user_id);
          } else {
            next.delete(status.user_id);
          }
          return next;
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !selectedConversation || !user) return;

    try {
      // Upload attachments first
      const attachmentUrls = await Promise.all(
        attachments.map((file) => messagesService.uploadAttachment(file))
      );

      // Send message with attachments
      await messagesService.sendMessage({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage,
        attachments: attachmentUrls,
        is_read: false
      });

      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation): ConversationParticipant => {
    if (!user) return conversation.participant_1;
    return conversation.participant_1_id === user.id
      ? conversation.participant_2
      : conversation.participant_1;
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            return (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                    {otherParticipant.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{otherParticipant.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(conversation.last_message_at).toLocaleTimeString()}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="min-w-[1.25rem] h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const otherParticipant = getOtherParticipant(selectedConversation);
                return (
                  <>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      {otherParticipant.is_online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900">{otherParticipant.name}</h2>
                      <p className="text-sm text-green-500">
                        {otherParticipant.is_online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Phone className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Video className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm underline"
                        >
                          <FileText className="w-4 h-4" />
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto">
                {attachments.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="attachment"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-gray-400 hover:text-gray-600">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,application/pdf"
                />
                <Paperclip className="w-5 h-5" />
              </label>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() && attachments.length === 0}
                className="text-primary hover:text-primary/90 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
} 