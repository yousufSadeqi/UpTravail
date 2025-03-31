export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
}

export interface Message {
  id: string;
  sender: 'client' | 'worker';
  content: string;
  timestamp: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
}

export interface Job {
  id: string;
  title: string;
  client: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'paused';
  budget: string;
  paymentStatus: 'pending' | 'processing' | 'paid';
  location: string;
  dueDate: string;
  description: string;
  startDate: string;
  progress: number;
  milestones: Milestone[];
  messages: Message[];
  clientRating?: number;
  clientFeedback?: string;
  workerResponse?: string;
  documents: Document[];
} 