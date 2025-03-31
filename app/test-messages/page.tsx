'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { messageService } from '@/services/messageService';
import { supabase } from '@/lib/supabase';

export default function TestMessages() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [testWorkerId, setTestWorkerId] = useState('');
  const [channel, setChannel] = useState<any>(null);
  const [debug, setDebug] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Create a test worker
  const createTestWorker = async () => {
    try {
      addDebugLog('Creating test worker...');
      const { data: worker, error } = await supabase
        .from('workers')
        .insert({
          user_id: user?.id,
          name: 'Test Worker',
          email: 'test@example.com',
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        addDebugLog(`Error creating worker: ${error.message}`);
        throw error;
      }
      
      addDebugLog(`Worker created successfully: ${worker.id}`);
      setTestWorkerId(worker.id);
      return worker;
    } catch (error) {
      console.error('Error creating test worker:', error);
      return null;
    }
  };

  // Initialize test conversation
  const initializeTest = async () => {
    if (!user) {
      addDebugLog('No user found');
      return;
    }

    try {
      addDebugLog(`Initializing test for user: ${user.id}`);
      
      // Create test worker if needed
      let worker = await createTestWorker();
      if (!worker) {
        addDebugLog('Failed to create worker');
        return;
      }

      // Get or create conversation
      addDebugLog('Getting or creating conversation...');
      const conversation = await messageService.getOrCreateConversation(user.id, worker.id);
      addDebugLog(`Conversation created/found: ${conversation.id}`);
      setConversation(conversation);

      // Fetch existing messages
      addDebugLog('Fetching messages...');
      const messages = await messageService.getMessages(conversation.id);
      addDebugLog(`Found ${messages.length} messages`);
      setMessages(messages);

      // Set up real-time subscription
      addDebugLog('Setting up real-time subscription...');
      const channel = supabase
        .channel(`conversation:${conversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversation.id}`
          },
          (payload) => {
            addDebugLog(`New message received: ${payload.new.id}`);
            setMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      setChannel(channel);
      addDebugLog('Test initialization complete');
    } catch (error) {
      addDebugLog(`Error in initialization: ${error.message}`);
      console.error('Error initializing test:', error);
    }
  };

  // Cleanup function
  const cleanupTest = async () => {
    if (channel) {
      await channel.unsubscribe();
    }

    if (conversation) {
      // Delete messages
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversation.id);

      // Delete conversation
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);
    }

    if (testWorkerId) {
      // Delete test worker
      await supabase
        .from('workers')
        .delete()
        .eq('id', testWorkerId);
    }

    setConversation(null);
    setMessages([]);
    setTestWorkerId('');
    setChannel(null);
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!conversation || !user || !newMessage.trim()) {
      addDebugLog('Cannot send message: missing required data');
      return;
    }

    try {
      addDebugLog('Sending message...');
      const message = await messageService.sendMessage(
        conversation.id,
        user.id,
        conversation.worker_id,
        newMessage
      );
      addDebugLog(`Message sent successfully: ${message.id}`);
      setNewMessage('');
    } catch (error) {
      addDebugLog(`Error sending message: ${error.message}`);
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    initializeTest();
    return () => {
      cleanupTest();
    };
  }, [user]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Message System Test</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Test Status:</h2>
        <div className="space-y-2">
          <p>User ID: {user?.id || 'Not logged in'}</p>
          <p>Conversation: {conversation ? 'Active' : 'Not initialized'}</p>
          <p>Worker ID: {testWorkerId || 'Not created'}</p>
          <p>Messages: {messages.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Messages:</h2>
        <div className="border rounded-lg p-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet. Try sending one!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 p-2 rounded ${
                  message.sender_id === user?.id
                    ? 'bg-blue-100 ml-auto'
                    : 'bg-gray-100'
                } max-w-[80%]`}
              >
                <p>{message.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a test message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={sendTestMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Debug Logs:</h2>
        <div className="border rounded-lg p-4 h-48 overflow-y-auto bg-gray-50">
          {debug.map((log, index) => (
            <p key={index} className="text-sm font-mono">{log}</p>
          ))}
        </div>
      </div>

      <button
        onClick={cleanupTest}
        className="mt-4 bg-red-500 text-white px-4 py-1 rounded"
      >
        Cleanup Test Data
      </button>
    </div>
  );
} 