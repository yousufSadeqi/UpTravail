import { supabase } from '@/lib/supabase';
import { Message, Conversation } from '@/types/database';

export const messageService = {
  // Create a new conversation
  async createConversation(clientId: string, workerId: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        worker_id: workerId,
        last_message: '',
        unread_count: 0,
        archived: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get or create conversation
  async getOrCreateConversation(clientId: string, workerId: string): Promise<Conversation> {
    // First try to find existing conversation
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('worker_id', workerId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingConversation) {
      return existingConversation;
    }

    // If no conversation exists, create a new one
    return this.createConversation(clientId, workerId);
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    attachments: string[] = []
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        attachments,
        status: 'sent'
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString(),
        unread_count: supabase.raw('unread_count + 1')
      })
      .eq('id', conversationId);

    return data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true, status: 'read' })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;

    // Reset unread count
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
  }
}; 