'use client';

import { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import JobApplicationModal from './JobApplicationModal';

interface Job {
  id: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  duration: string;
  type: string;
  postedAt: string;
}

export default function JobListings() {
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Bathroom Renovation Project',
      description: 'Need an experienced plumber for a complete bathroom renovation including new fixtures installation and plumbing work.',
      budget: '$2000-$2500',
      location: 'Brooklyn, NY',
      duration: '2 weeks',
      type: 'Fixed Price',
      postedAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Emergency Electrical Repair',
      description: 'Looking for a certified electrician for urgent electrical system repair in a residential building.',
      budget: '$150/hour',
      location: 'Manhattan, NY',
      duration: '1-2 days',
      type: 'Hourly',
      postedAt: '5 hours ago'
    },
    // Add more sample jobs...
  ]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSubmitApplication = (data: ApplicationData) => {
    console.log('Application submitted:', { job: selectedJob, ...data });
    setSelectedJob(null);
    // Here you would typically send this data to your API
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            Plumbing
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            Electrical
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            New York
          </span>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{job.description}</p>
              </div>
              <button 
                onClick={() => handleApply(job)}
                className="btn-primary"
              >
                Apply Now
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="w-4 h-4" />
                <span>{job.budget}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{job.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="w-4 h-4" />
                <span>{job.type}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">Posted {job.postedAt}</span>
              <button className="text-primary hover:text-primary/90 text-sm font-medium">
                Save Job
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSubmit={handleSubmitApplication}
        />
      )}
    </div>
  );
} 