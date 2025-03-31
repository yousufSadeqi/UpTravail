import { Clock, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

export interface JobProps {
  id: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  postedAt: string;
  status: 'open' | 'in_progress' | 'completed';
  category: string;
}

export default function JobCard({ 
  id,
  title, 
  description, 
  budget, 
  location, 
  postedAt,
  status,
  category 
}: JobProps) {
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link 
            href={`/dashboard/jobs/${id}`}
            className="text-lg font-semibold hover:text-primary"
          >
            {title}
          </Link>
          <p className="text-sm text-gray-600">{category}</p>
        </div>
        <span className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${status === 'open' ? 'bg-green-100 text-green-800' : 
            status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'}
        `}>
          {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          {budget}
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {postedAt}
        </div>
      </div>
    </div>
  );
} 