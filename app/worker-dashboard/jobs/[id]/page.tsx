'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Tag,
  User,
  Send
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

interface JobDetails extends Job {
  client: {
    id: string;
    name: string;
    rating: number;
    jobs_posted: number;
    hire_rate: number;
  };
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    bidAmount: '',
    estimatedDuration: ''
  });

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_id (
            id,
            raw_user_meta_data->name as name,
            raw_user_meta_data->rating as rating,
            raw_user_meta_data->jobs_posted as jobs_posted,
            raw_user_meta_data->hire_rate as hire_rate
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (err) {
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;

    setApplying(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          worker_id: user.id,
          proposal_text: proposal.coverLetter,
          price_bid: parseFloat(proposal.bidAmount),
          estimated_duration: proposal.estimatedDuration,
          status: 'pending'
        });

      if (error) throw error;

      router.push('/worker-dashboard/my-proposals?success=true');
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Job not found</h2>
            <button
              onClick={() => router.back()}
              className="mt-4 text-primary hover:text-primary/90"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to jobs
        </button>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{job.client.rating?.toFixed(1) || '4.5'}</span>
                <span className="mx-2">•</span>
                <span>{job.client.jobs_posted} jobs posted</span>
                <span className="mx-2">•</span>
                <span>{job.client.hire_rate}% hire rate</span>
              </div>
            </div>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit Proposal
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-2" />
              {job.budget_type === 'fixed' 
                ? `$${job.budget_amount} fixed` 
                : `$${job.budget_amount}/hr`}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {job.timeline?.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.required_skills.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Proposal Form */}
          <form onSubmit={handleSubmitProposal} className="mt-12 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Submit a Proposal</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cover Letter
              </label>
              <textarea
                required
                rows={6}
                value={proposal.coverLetter}
                onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Introduce yourself and explain why you're the best fit for this job..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Bid ({job.budget_type === 'fixed' ? 'Fixed' : 'Hourly Rate'})
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={proposal.bidAmount}
                    onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })}
                    className="block w-full pl-7 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Duration
                </label>
                <select
                  required
                  value={proposal.estimatedDuration}
                  onChange={(e) => setProposal({ ...proposal, estimatedDuration: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select duration</option>
                  <option value="less_than_1_week">Less than 1 week</option>
                  <option value="1_to_2_weeks">1 to 2 weeks</option>
                  <option value="2_to_4_weeks">2 to 4 weeks</option>
                  <option value="1_to_3_months">1 to 3 months</option>
                  <option value="3_to_6_months">3 to 6 months</option>
                  <option value="more_than_6_months">More than 6 months</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={applying}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {applying ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}