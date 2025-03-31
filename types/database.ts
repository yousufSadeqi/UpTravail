export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  status: 'sent' | 'delivered' | 'read';
  conversation_id: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  client_id: string;
  worker_id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  archived: boolean;
  created_at: string;
}

export interface MessageStatus {
  message_id: string;
  status: 'sent' | 'delivered' | 'read';
  updated_at: string;
} 