import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  attachments?: string[];
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar_url: string;
  is_online: boolean;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  participant_1: ConversationParticipant;
  participant_2: ConversationParticipant;
}

interface TypingStatus {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}

export const messagesService = {
  // Get all conversations for a user
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:participant_1_id(id, name, avatar_url),
        participant_2:participant_2_id(id, name, avatar_url)
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Send a new message
  async sendMessage(message: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', userId);

    if (error) throw error;
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },

  // Subscribe to conversation updates
  subscribeToConversations(userId: string, callback: (conversation: Conversation) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1_id=eq.${userId},participant_2_id=eq.${userId})`
        },
        (payload) => callback(payload.new as Conversation)
      )
      .subscribe();
  },

  // Upload file attachment
  async uploadAttachment(file: File) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Update typing status
  async updateTypingStatus(status: TypingStatus) {
    const { error } = await supabase
      .from('typing_status')
      .upsert([status], {
        onConflict: 'conversation_id,user_id'
      });

    if (error) throw error;
  },

  // Subscribe to typing status changes
  subscribeToTypingStatus(conversationId: string, callback: (status: TypingStatus) => void) {
    return supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => callback(payload.new as TypingStatus)
      )
      .subscribe();
  }
}; 