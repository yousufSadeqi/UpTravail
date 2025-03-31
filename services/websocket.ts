import { Message, Conversation } from '../types/messages';

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  connect() {
    // Replace with your WebSocket server URL
    this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.notifyConnectionStatus(true);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.notifyConnectionStatus(false);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyConnectionStatus(false);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.notifyMessageHandlers(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        payload: message
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  markMessageAsRead(messageId: string, conversationId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'mark_read',
        payload: { messageId, conversationId }
      }));
    }
  }

  subscribeToMessages(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  subscribeToConnectionStatus(handler: (connected: boolean) => void) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  private notifyMessageHandlers(message: Message) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
  }
}

export const websocketService = new WebSocketService(); 