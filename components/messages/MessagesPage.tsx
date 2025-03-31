import { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send, Paperclip, MoreVertical, Archive, Trash2, Check, X } from 'lucide-react';
import { websocketService } from '../../services/websocket';
import { Message, Conversation } from '../../types/messages';
import { FileUploadService } from '../../services/fileUpload';
import FileAttachment from './FileAttachment';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    websocketService.connect();

    // Subscribe to messages
    const unsubscribeMessages = websocketService.subscribeToMessages((message) => {
      handleNewMessage(message);
    });

    // Subscribe to connection status
    const unsubscribeConnection = websocketService.subscribeToConnectionStatus((connected) => {
      setIsConnected(connected);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeMessages();
      unsubscribeConnection();
      websocketService.disconnect();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleNewMessage = (message: Message) => {
    setConversations(prevConversations => {
      const conversationIndex = prevConversations.findIndex(
        conv => conv.id === message.conversationId
      );

      if (conversationIndex === -1) {
        // New conversation
        return [...prevConversations, {
          id: message.conversationId,
          workerName: message.sender, // You might want to fetch worker details here
          lastMessage: message.content,
          timestamp: message.timestamp,
          unreadCount: 1,
          messages: [message],
          isArchived: false
        }];
      }

      // Update existing conversation
      const updatedConversations = [...prevConversations];
      const conversation = updatedConversations[conversationIndex];
      
      conversation.lastMessage = message.content;
      conversation.timestamp = message.timestamp;
      conversation.unreadCount += 1;
      conversation.messages.push(message);

      return updatedConversations;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = FileUploadService.validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedConversation) return;

    try {
      const uploadResult = await FileUploadService.uploadFile(selectedFile);
      
      const message: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'client',
        content: `Shared file: ${uploadResult.filename}`,
        isRead: false,
        conversationId: selectedConversation.id,
        attachments: [uploadResult.url]
      };

      websocketService.sendMessage(message);
      setSelectedFile(null);
      setUploadError(null);
    } catch (error) {
      setUploadError('Failed to upload file');
      console.error('File upload error:', error);
    }
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

    if (selectedFile) {
      handleFileUpload();
    } else {
      const message: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'client',
        content: newMessage,
        isRead: false,
        conversationId: selectedConversation.id
      };

      websocketService.sendMessage(message);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{conversation.workerName}</h3>
                {conversation.unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              <p className="text-xs text-gray-400 mt-1">
                {conversation.timestamp.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedConversation.workerName}</h3>
                <p className="text-sm text-gray-500">
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'client' ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === 'client'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.attachments?.map((url, index) => (
                      <div key={index} className="mt-2">
                        <FileAttachment
                          url={url}
                          filename={url.split('/').pop() || 'File'}
                          fileType={url.split('.').pop() || ''}
                        />
                      </div>
                    ))}
                    <div className="flex items-center justify-end mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.sender === 'client' && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex flex-col gap-2">
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                    <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {uploadError && (
                  <p className="text-red-500 text-sm">{uploadError}</p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary/90"
                    onClick={handleSendMessage}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
} 