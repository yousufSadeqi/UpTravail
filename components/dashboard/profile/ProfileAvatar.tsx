import { User, Camera } from 'lucide-react';
import { getContrastColor } from '@/lib/utils/colors';

interface ProfileAvatarProps {
  isEditing?: boolean;
  avatarUrl?: string;
  previewUrl?: string;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'lg';
}

export function ProfileAvatar({ 
  isEditing, 
  avatarUrl, 
  previewUrl, 
  onImageChange,
  size = 'sm' 
}: ProfileAvatarProps) {
  const sizeClasses = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  return (
    <div className="relative">
      <div className={`${sizeClasses} rounded-full overflow-hidden bg-white`}>
        {(previewUrl || avatarUrl) ? (
          <img
            src={previewUrl || avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <User className={`${size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} text-primary`} />
          </div>
        )}
      </div>
      {isEditing && (
        <>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </>
      )}
    </div>
  );
} 