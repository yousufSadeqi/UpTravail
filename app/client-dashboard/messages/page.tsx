'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  MessageSquare, 
  Send, 
  Paperclip,
  MoreVertical,
  Archive,
  Trash2,
  Check,
  CheckCheck,
  Smile,
  ChevronDown
} from 'lucide-react';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  attachments: string[];
  conversation_id: string;
  reactions?: Reaction[];
  parent_id?: string;
  replies?: Message[];
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  worker_id: string;
  worker_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  archived: boolean;
}

const EMOJIS = ['😀', '😂', '😊', '❤️', '👍', '👎', '🎉', '🙏', '😍', '😭', '😅', '😆', '😉', '😋', '😎', '😡', '😢', '', '😨', '😩'];

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<Message | null>(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);

  // Fetch conversations on component mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Filter messages based on search query
  useEffect(() => {
    if (!messageSearchQuery) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(message => 
      message.content.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
      message.attachments?.some(attachment => 
        attachment.name.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    );
    setFilteredMessages(filtered);
  }, [messageSearchQuery, messages]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          worker_id,
          worker:workers(name),
          last_message,
          last_message_time,
          unread_count,
          archived
        `)
        .eq('client_id', user?.id)
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      setConversations(data.map(conv => ({
        id: conv.id,
        worker_id: conv.worker_id,
        worker_name: conv.worker.name,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count,
        archived: conv.archived
      })));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.worker_id,
          content: newMessage.trim(),
          conversation_id: selectedConversation.id,
          read: false,
          status: 'sent',
          attachments: []
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString(),
          unread_count: 0
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      setMessages(prev => [...prev, data]);
      setMessageStatuses(prev => ({
        ...prev,
        [data.id]: 'sent'
      }));

      setTimeout(() => {
        updateMessageStatus(data.id, 'delivered');
        setTimeout(() => {
          updateMessageStatus(data.id, 'read');
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;

      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: status
      }));
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${activeFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${activeFilter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveFilter('archived')}
              className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${activeFilter === 'archived'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            conversations
              .filter(conv => {
                if (activeFilter === 'unread') return conv.unread_count > 0;
                if (activeFilter === 'archived') return conv.archived;
                return true;
              })
              .filter(conv =>
                conv.worker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`
                    p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50
                    ${selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''}
                    ${conversation.archived ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{conversation.worker_name}</h3>
                        {conversation.archived && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.last_message_time).toLocaleDateString()}
                      </p>
                      {conversation.unread_count > 0 && !conversation.archived && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-primary rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedConversation.worker_name}</h2>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={messageSearchQuery}
                      onChange={(e) => setMessageSearchQuery(e.target.value)}
                      className="pl-8 pr-4 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[70%] rounded-lg p-3 relative group
                      ${message.sender_id === user?.id
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender_id !== user?.id && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        {message.sender_id !== user?.id && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {message.sender_id === user?.id ? 'You' : selectedConversation.worker_name}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                          {message.sender_id === user?.id && (
                            <span className="ml-1">
                              {messageStatuses[message.id] === 'sent' && <Check className="h-3 w-3" />}
                              {messageStatuses[message.id] === 'delivered' && <CheckCheck className="h-3 w-3" />}
                              {messageStatuses[message.id] === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  disabled={isSending}
                />
                <button
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isSending 
                      ? 'bg-primary/70 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90'
                    }
                  `}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  // Handle file upload
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
} 