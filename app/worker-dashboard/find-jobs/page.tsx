'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Star,
  MapPin, 
  Clock, 
  DollarSign,
  Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  budget_type: 'fixed' | 'hourly';
  budget_amount: number;
  location: {
    city: string;
    state: string;
    isRemote: boolean;
  };
  required_skills: string[];
  timeline: string;
  created_at: string;
  proposals_count: number;
  client: {
    id: string;
    name: string;
    rating: number;
  };
}

export default function FindJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['Fixed Price']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_id (
            id,
            raw_user_meta_data->name as name,
            raw_user_meta_data->rating as rating
          ),
          proposals:job_applications(count)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include proposals_count
      const jobsWithProposals = data?.map(job => ({
        ...job,
        proposals_count: job.proposals?.[0]?.count || 0
      })) || [];

      setJobs(jobsWithProposals);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeFilters.includes('Fixed Price') && job.budget_type !== 'fixed') {
      return false;
    }
    if (activeFilters.includes('Hourly') && job.budget_type !== 'hourly') {
      return false;
    }
    // Add location filter
    if (activeFilters.includes('New York') && 
        !(job.location.city.includes('New York') || job.location.state.includes('NY'))) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Save Search Button */}
        <div className="mb-6">
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Save Search
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            {['Fixed Price', 'Hourly', 'New York'].map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilters.includes(filter)
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/worker-dashboard/jobs/${job.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{job.client.rating?.toFixed(1) || '4.5'}</span>
                    <span className="mx-2">•</span>
                    <span>{job.proposals_count} proposals</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Apply Now
                </button>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {job.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.required_skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  {job.budget_type === 'fixed' 
                    ? `$${job.budget_amount} fixed` 
                    : `$${job.budget_amount}/hr`}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.timeline?.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No jobs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}