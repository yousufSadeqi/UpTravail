'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  X, 
  Loader2,
  Plus,
  DollarSign,
  CheckCircle
} from 'lucide-react';

// Job categories with subcategories
const jobCategories = {
  'Home Services': [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Carpentry',
    'Painting',
    'General Repairs'
  ],
  'Professional Services': [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing',
    'Legal Services'
  ],
  'Skilled Trade': [
    'Welding',
    'Masonry',
    'Flooring',
    'Roofing',
    'Landscaping'
  ]
};

interface FormData {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  budget_type: 'fixed' | 'hourly';
  budget_amount: string;
  location: {
    city: string;
    state: string;
    isRemote: boolean;
  };
  required_skills: string[];
  attachments: File[];
  timeline: string;
}

// First, add these style constants at the top of the file, after the interfaces
const inputStyles = `
  mt-1 block w-full px-4 py-3 
  bg-white text-gray-900 
  border border-gray-300 rounded-lg 
  shadow-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
  disabled:bg-gray-50 disabled:text-gray-500
`;

const selectStyles = `
  mt-1 block w-full px-4 py-3
  bg-white text-gray-900 
  border border-gray-300 rounded-lg 
  shadow-sm 
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
  disabled:bg-gray-50 disabled:text-gray-500
`;

const textareaStyles = `
  mt-1 block w-full px-4 py-3
  bg-white text-gray-900 
  border border-gray-300 rounded-lg 
  shadow-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
  resize-none
`;

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Add this useEffect to check authentication
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/client-dashboard/post-job');
    }
  }, [user, router]);

  // If not authenticated, show loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    subcategory: '',
    description: '',
    budget_type: 'fixed',
    budget_amount: '',
    location: {
      city: '',
      state: '',
      isRemote: false
    },
    required_skills: [],
    attachments: [],
    timeline: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file size (10MB limit)
      const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        setError('Some files exceed the 10MB size limit');
        return;
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('You must be logged in to post a job');
      }

      // Upload attachments first
      const attachmentUrls = await Promise.all(
        formData.attachments.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('jobs')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('jobs')
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Create job posting with proper client_id
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: session.user.id,
          title: formData.title,
          category: formData.category,
          subcategory: formData.subcategory,
          description: formData.description,
          budget_type: formData.budget_type,
          budget_amount: parseFloat(formData.budget_amount),
          location: formData.location,
          required_skills: formData.required_skills,
          attachments: attachmentUrls,
          timeline: formData.timeline,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Show success message and reset form
      setSuccess(true);
      setFormData({
        title: '',
        category: '',
        subcategory: '',
        description: '',
        budget_type: 'fixed',
        budget_amount: '',
        location: {
          city: '',
          state: '',
          isRemote: false
        },
        required_skills: [],
        attachments: [],
        timeline: ''
      });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Error posting job:', err);
      setError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg border border-green-100 flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Job posted successfully!</span>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputStyles}
              placeholder="e.g., Plumbing Repair Needed"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subcategory: ''
                  });
                }}
                className={selectStyles}
              >
                <option value="">Select Category</option>
                {Object.keys(jobCategories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <select
                required
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className={selectStyles}
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {formData.category &&
                  jobCategories[formData.category as keyof typeof jobCategories].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={textareaStyles}
              placeholder="Describe the job requirements and expectations..."
            />
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget Type
              </label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budget_type: 'fixed' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    formData.budget_type === 'fixed'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, budget_type: 'hourly' })}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    formData.budget_type === 'hourly'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget Amount {formData.budget_type === 'hourly' && '(per hour)'}
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.budget_amount}
                  onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
                  className={`${inputStyles} pl-10`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.location.isRemote}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      location: { ...formData.location, isRemote: e.target.checked }
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">This is a remote job</span>
              </label>
            </div>

            {!formData.location.isRemote && (
              <div className="mt-3 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required={!formData.location.isRemote}
                  placeholder="City"
                  value={formData.location.city}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value }
                    })
                  }
                  className={inputStyles}
                  disabled={formData.location.isRemote}
                />
                <input
                  type="text"
                  required={!formData.location.isRemote}
                  placeholder="State"
                  value={formData.location.state}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value }
                    })
                  }
                  className={inputStyles}
                  disabled={formData.location.isRemote}
                />
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Required Skills
            </label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                className={`${inputStyles} rounded-r-none`}
                placeholder="Add required skills..."
              />
              <button
                type="button"
                onClick={handleSkillAdd}
                className="px-6 border border-l-0 border-transparent rounded-r-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Add
              </button>
            </div>

            {formData.required_skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Project Timeline
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className={selectStyles}
            >
              <option value="">Select timeline (optional)</option>
              <option value="less_than_1_week">Less than 1 week</option>
              <option value="1_to_2_weeks">1 to 2 weeks</option>
              <option value="2_to_4_weeks">2 to 4 weeks</option>
              <option value="1_to_3_months">1 to 3 months</option>
              <option value="3_to_6_months">3 to 6 months</option>
              <option value="more_than_6_months">More than 6 months</option>
            </select>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <div className="mt-1">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary/60 transition-colors">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>

              {formData.attachments.length > 0 && (
                <ul className="mt-4 divide-y divide-gray-200">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                relative inline-flex items-center justify-center
                px-8 py-3 border border-transparent rounded-lg
                text-base font-medium text-white
                transition-all duration-300 ease-in-out
                ${isSubmitting 
                  ? 'bg-primary/80 cursor-not-allowed pl-12' 
                  : 'bg-primary hover:bg-primary/90 hover:scale-105 active:scale-100'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                disabled:opacity-80 shadow-lg hover:shadow-xl
                overflow-hidden
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="ml-2 opacity-70">Posting Job...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Post Job</span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}