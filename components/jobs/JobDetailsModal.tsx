'use client';

import { useState } from 'react';
import { 
  X, Clock, DollarSign, MapPin, Calendar, MessageSquare, 
  FileText, Star, Send, Paperclip, ChevronDown, CheckCircle2
} from 'lucide-react';
import type { Job, Message, Milestone } from '@/types/jobs';
import DocumentSection from './DocumentSection';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onUpdateProgress: (jobId: string, progress: number) => void;
  onUpdateMilestone: (jobId: string, milestoneId: string, status: Milestone['status']) => void;
  onSendMessage: (jobId: string, message: string) => void;
  onUploadDocument: (jobId: string, files: FileList) => void;
  onDeleteDocument: (jobId: string, documentId: string) => void;
}

export default function JobDetailsModal({
  job,
  onClose,
  onUpdateProgress,
  onUpdateMilestone,
  onSendMessage,
  onUploadDocument,
  onDeleteDocument
}: JobDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'messages' | 'documents'>('overview');
  const [newMessage, setNewMessage] = useState('');
  const [progressUpdate, setProgressUpdate] = useState(job.progress);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(job.id, newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500">Client: {job.client}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {['overview', 'milestones', 'messages', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-4 px-4 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium text-gray-900">{job.budget}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(job.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(job.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{job.description}</p>
              </div>

              {/* Progress Update */}
              {job.status === 'in_progress' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Progress Update</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-medium text-gray-900">{progressUpdate}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressUpdate}
                        onChange={(e) => setProgressUpdate(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => onUpdateProgress(job.id, progressUpdate)}
                      className="btn-primary w-full"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              )}

              {/* Client Feedback for completed jobs */}
              {job.status === 'completed' && job.clientRating && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Client Feedback</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < job.clientRating! ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{job.clientFeedback}</p>
                    {job.workerResponse && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">Your response: </span>
                          {job.workerResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4">
              {job.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <select
                      value={milestone.status}
                      onChange={(e) => onUpdateMilestone(job.id, milestone.id, e.target.value as Milestone['status'])}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {job.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'worker' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender === 'worker'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="flex items-center gap-2">
                  <button type="button" className="text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="text-primary hover:text-primary/90 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentSection
              jobId={job.id}
              documents={job.documents}
              onUpload={onUploadDocument}
              onDelete={onDeleteDocument}
            />
          )}
        </div>
      </div>
    </div>
  );
} 