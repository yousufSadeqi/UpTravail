'use client';

import { useState } from 'react';
import { 
  Clock, DollarSign, MapPin, CheckCircle2, XCircle, AlertCircle,
  Calendar, MessageSquare, FileText, MoreVertical, ChevronRight,
  Home, Briefcase, Search, Bell, User, ChevronDown, Menu, Star, Settings
} from 'lucide-react';
import JobDetailsModal from '@/components/jobs/JobDetailsModal';
import type { Job } from '@/types/jobs';

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
}

interface Message {
  id: string;
  sender: 'client' | 'worker';
  content: string;
  timestamp: string;
}

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed' | 'pending' | 'cancelled'>('in_progress');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Bathroom Renovation',
      client: 'Sarah Johnson',
      status: 'in_progress',
      budget: '$2,500',
      paymentStatus: 'pending',
      location: 'Brooklyn, NY',
      startDate: '2024-02-01',
      dueDate: '2024-02-28',
      progress: 65,
      description: 'Complete bathroom renovation including new fixtures installation and plumbing work.',
      milestones: [
        {
          id: '1',
          title: 'Demolition and Preparation',
          dueDate: '2024-02-05',
          status: 'completed',
          description: 'Remove old fixtures and prepare the space'
        },
        {
          id: '2',
          title: 'Plumbing Installation',
          dueDate: '2024-02-15',
          status: 'in_progress',
          description: 'Install new plumbing fixtures'
        },
        {
          id: '3',
          title: 'Finishing and Cleanup',
          dueDate: '2024-02-28',
          status: 'pending',
          description: 'Final touches and cleanup'
        }
      ],
      messages: [
        {
          id: '1',
          sender: 'client',
          content: 'How\'s the progress on the plumbing installation?',
          timestamp: '2024-02-10T10:30:00Z'
        },
        {
          id: '2',
          sender: 'worker',
          content: 'Going well! Should be done with the fixtures by tomorrow.',
          timestamp: '2024-02-10T10:35:00Z'
        }
      ],
      documents: []
    },
    // Add more jobs...
  ]);

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs', href: '/my-jobs', count: 3 },
    { icon: <Search className="w-5 h-5" />, label: 'Find Jobs', href: '/find-jobs' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', href: '/earnings' },
    { icon: <Star className="w-5 h-5" />, label: 'Reviews', href: '/reviews' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'paused':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredJobs = jobs.filter(job => job.status === activeTab);

  const handleUpdateProgress = async (jobId: string, progress: number) => {
    // Update job progress
    console.log('Updating progress:', { jobId, progress });
  };

  const handleUpdateMilestone = async (jobId: string, milestoneId: string, status: Milestone['status']) => {
    // Update milestone status
    console.log('Updating milestone:', { jobId, milestoneId, status });
  };

  const handleSendMessage = async (jobId: string, message: string) => {
    // Send new message
    console.log('Sending message:', { jobId, message });
  };

  const handleUploadDocument = async (jobId: string, files: FileList) => {
    // Here you would typically:
    // 1. Upload files to storage (e.g., S3, Supabase Storage)
    // 2. Create document records in the database
    // 3. Update the UI
    console.log('Uploading documents:', { jobId, files });
  };

  const handleDeleteDocument = async (jobId: string, documentId: string) => {
    // Here you would typically:
    // 1. Delete file from storage
    // 2. Delete document record from database
    // 3. Update the UI
    console.log('Deleting document:', { jobId, documentId });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                  item.label === 'My Jobs'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">My Jobs</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button className="btn-secondary">
                Export Report
              </button>
              <button className="btn-primary">
                Find New Jobs
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-6">
              {['in_progress', 'pending', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`pb-4 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {tab === activeTab && (
                    <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      {filteredJobs.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">Client: {job.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{job.description}</p>

                {/* Progress Bar for In Progress Jobs */}
                {job.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{job.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {new Date(job.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                      <MessageSquare className="w-4 h-4" />
                      <span>Messages ({job.messages.length})</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                      <FileText className="w-4 h-4" />
                      <span>Documents</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                      <MoreVertical className="w-4 h-4" />
                      <span>More</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center gap-1 text-primary hover:text-primary/90"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Job Details Modal */}
          {selectedJob && (
            <JobDetailsModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onUpdateProgress={handleUpdateProgress}
              onUpdateMilestone={handleUpdateMilestone}
              onSendMessage={handleSendMessage}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}
        </div>
      </main>
    </div>
  );
} 