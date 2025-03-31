import { useState } from 'react';
import { ValidationError, validateProfileData } from '@/lib/utils/validation';
import { FormField } from '@/components/ui/FormField';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileFormProps {
  profileData: ProfileData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (data: Partial<ProfileData>) => void;
  onCancel: () => void;
  isLoading: boolean;
  avatarPreview?: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileForm({
  profileData,
  onSubmit,
  onChange,
  onCancel,
  isLoading,
  avatarPreview,
  onImageChange
}: ProfileFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProfileData(profileData);
    
    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, error) => ({
        ...acc,
        [error.field]: error.message
      }), {});
      setErrors(errorMap);
      return;
    }

    setErrors({});
    await onSubmit(e);
  };

  const handleChange = (data: Partial<ProfileData>) => {
    // Clear error when field is edited
    if (Object.keys(data)[0] in errors) {
      setErrors(prev => {
        const { [Object.keys(data)[0]]: _, ...rest } = prev;
        return rest;
      });
    }
    onChange(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <ProfileAvatar
          isEditing
          avatarUrl={profileData.avatar_url}
          previewUrl={avatarPreview}
          onImageChange={onImageChange}
          size="lg"
        />
        <div>
          <h3 className="font-medium text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-600">
            JPG, GIF or PNG. Max size of 2MB.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          label="Full Name"
          value={profileData.full_name}
          onChange={(value) => handleChange({ full_name: value })}
          required
          error={errors.full_name}
        />

        <FormField
          label="Phone"
          type="tel"
          value={profileData.phone}
          onChange={(value) => handleChange({ phone: value })}
          error={errors.phone}
        />

        <FormField
          label="Bio"
          type="textarea"
          value={profileData.bio}
          onChange={(value) => handleChange({ bio: value })}
          rows={4}
        />

        <FormField
          label="Profession"
          value={profileData.profession}
          onChange={(value) => handleChange({ profession: value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Hourly Rate ($)"
            type="number"
            value={profileData.hourly_rate}
            onChange={(value) => handleChange({ hourly_rate: value })}
          />

          <FormField
            label="Years of Experience"
            type="number"
            value={profileData.experience_years}
            onChange={(value) => handleChange({ experience_years: value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 