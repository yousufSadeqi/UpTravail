'use client';

import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import JobCard, { JobProps } from '@/components/dashboard/jobs/JobCard';
import Link from 'next/link';
import { inputStyles } from '@/lib/utils/styles';

const mockJobs: JobProps[] = [
  {
    id: '1',
    title: 'Bathroom Plumbing Repair',
    description: 'Need a professional plumber to fix a leaking pipe and install a new shower head in the master bathroom.',
    budget: '$150-$200',
    location: 'San Francisco, CA',
    postedAt: '2 hours ago',
    status: 'open',
    category: 'Plumbing'
  },
  {
    id: '2',
    title: 'Electrical Wiring Installation',
    description: 'Looking for a licensed electrician to install new wiring and outlets in the home office.',
    budget: '$300-$400',
    location: 'San Jose, CA',
    postedAt: '1 day ago',
    status: 'in_progress',
    category: 'Electrical'
  },
  // Add more mock jobs as needed
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <Link href="/dashboard/jobs/create" className="btn-primary flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputStyles} pl-10`}
              style={{ color: 'black' }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-600">
              No jobs found matching your criteria
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 