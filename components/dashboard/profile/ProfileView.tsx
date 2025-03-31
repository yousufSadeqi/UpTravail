import { Mail, Phone, Briefcase, DollarSign } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileViewProps {
  profileData: ProfileData;
  userEmail?: string;
  onEdit: () => void;
}

export function ProfileView({ profileData, userEmail, onEdit }: ProfileViewProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button 
          onClick={onEdit} 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Edit Profile
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <ProfileAvatar avatarUrl={profileData.avatar_url} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profileData.full_name}</h2>
            <p className="text-gray-600">{profileData.profession}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <InfoItem icon={Mail} label="Email" value={userEmail} />
          <InfoItem icon={Phone} label="Phone" value={profileData.phone || 'Not provided'} />
          <InfoItem icon={Briefcase} label="Experience" value={`${profileData.experience_years} years`} />
          <InfoItem icon={DollarSign} label="Hourly Rate" value={`$${profileData.hourly_rate}/hr`} />
        </div>

        {profileData.bio && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
            <p className="text-gray-600">{profileData.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: {
  icon: any;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
} 