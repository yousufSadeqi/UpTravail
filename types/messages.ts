export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
  conversationId: string;
}

export interface Conversation {
  id: string;
  workerName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  messages: Message[];
  isArchived: boolean;
} 