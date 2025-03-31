'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Clock, MapPin, DollarSign, User, Calendar, Tag } from 'lucide-react';

// Mock data - would come from API in real app
const jobDetails = {
  id: '1',
  title: 'Bathroom Plumbing Repair',
  description: 'Need a professional plumber to fix a leaking pipe and install a new shower head in the master bathroom. The current pipe has been leaking for a few days and requires immediate attention. The shower head replacement is a secondary priority.',
  budget: '$150-$200',
  location: 'San Francisco, CA',
  postedAt: '2 hours ago',
  status: 'open',
  category: 'Plumbing',
  client: {
    name: 'John Smith',
    rating: 4.8,
    jobsPosted: 12
  },
  requirements: [
    'Licensed plumber',
    '5+ years experience',
    'Own tools and equipment',
    'Available for emergency repairs'
  ],
  timeline: 'Within 2 days'
};

export default function JobDetailsPage() {
  const params = useParams();
  const [isApplying, setIsApplying] = useState(false);
  const [proposal, setProposal] = useState('');

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement proposal submission
    console.log('Submitting proposal:', proposal);
    setIsApplying(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{jobDetails.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Posted {jobDetails.postedAt}
              </span>
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {jobDetails.category}
              </span>
            </div>
          </div>
          <span className={`
            px-4 py-2 rounded-full text-sm font-medium
            ${jobDetails.status === 'open' ? 'bg-green-100 text-green-800' : 
              jobDetails.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'}
          `}>
            {jobDetails.status.replace('_', ' ').charAt(0).toUpperCase() + jobDetails.status.slice(1)}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Job Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{jobDetails.description}</p>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {jobDetails.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            {isApplying && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Submit Proposal</h2>
                <form onSubmit={handleSubmitProposal}>
                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Describe why you're the best fit for this job..."
                    className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Budget</p>
                    <p>{jobDetails.budget}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{jobDetails.location}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">Timeline</p>
                    <p>{jobDetails.timeline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">About the Client</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{jobDetails.client.name}</p>
                  <p className="text-sm text-gray-600">{jobDetails.client.jobsPosted} jobs posted</p>
                </div>
              </div>
              <div className="flex items-center text-yellow-400">
                {'★'.repeat(Math.floor(jobDetails.client.rating))}
                <span className="ml-1 text-gray-600">
                  {jobDetails.client.rating} rating
                </span>
              </div>
            </div>

            {!isApplying && (
              <button
                onClick={() => setIsApplying(true)}
                className="w-full btn-primary"
              >
                Apply for this Job
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 