'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  User,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface JobApplication {
  id: string;
  worker_id: string;
  proposal_text: string;
  price_bid: number;
  estimated_duration: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  worker: {
    id: string;
    full_name: string;
    avatar_url?: string;
    rating: number;
    jobs_completed: number;
  };
}

interface JobDetails {
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
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  created_at: string;
  applications: JobApplication[];
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchJobDetails();
    }
  }, [user, params.id]);

  const fetchJobDetails = async () => {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', user?.id)
        .single();

      if (jobError) throw jobError;

      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          *,
          worker:worker_id (
            id,
            full_name,
            avatar_url,
            rating,
            jobs_completed
          )
        `)
        .eq('job_id', params.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      setJob({
        ...jobData,
        applications: applications || []
      });
    } catch (err) {
      console.error('Error fetching job details:', err);
      router.push('/client-dashboard/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (action === 'accept') {
        // Update job status to in_progress
        await supabase
          .from('jobs')
          .update({ status: 'in_progress' })
          .eq('id', params.id);
      }

      // Refresh job details
      fetchJobDetails();
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to jobs
        </button>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                {job.category} • {job.subcategory}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              job.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
              job.status === 'completed' ? 'bg-green-50 text-green-600' :
              job.status === 'canceled' ? 'bg-red-50 text-red-600' :
              'bg-yellow-50 text-yellow-600'
            }`}>
              {job.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
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
        </div>

        {/* Proposals Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Proposals ({job.applications.length})
          </h2>

          {job.applications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No proposals yet
            </div>
          ) : (
            <div className="space-y-6">
              {job.applications.map((application) => (
                <div key={application.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {application.worker.avatar_url ? (
                          <img
                            src={application.worker.avatar_url}
                            alt={application.worker.full_name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {application.worker.full_name}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{application.worker.rating.toFixed(1)} rating</span>
                          <span className="mx-2">•</span>
                          <span>{application.worker.jobs_completed} jobs completed</span>
                        </div>
                      </div>
                    </div>
                    {application.status === 'pending' && job.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplicationAction(application.id, 'accept')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'reject')}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                    {application.status !== 'pending' && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        application.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {application.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="whitespace-pre-wrap">{application.proposal_text}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Bid: ${application.price_bid}{job.budget_type === 'hourly' && '/hr'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration: {application.estimated_duration.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {application.status === 'accepted' && (
                    <div className="mt-4">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Worker
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}