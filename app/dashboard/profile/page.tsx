'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';
import { User, Mail, Phone, Briefcase, DollarSign, Camera } from 'lucide-react';
import { ProfileForm } from '@/components/dashboard/profile/ProfileForm';
import { ProfileView } from '@/components/dashboard/profile/ProfileView';

interface ProfileData {
  full_name: string;
  phone: string;
  bio: string;
  profession: string;
  hourly_rate: string;
  experience_years: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    bio: '',
    profession: '',
    hourly_rate: '',
    experience_years: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = profileData.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: crypto.randomUUID(),
          user_id: user?.id,
          ...profileData,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProfileData();
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          {isEditing ? (
            <ProfileForm
              profileData={profileData}
              onSubmit={handleSubmit}
              onChange={(data) => setProfileData({ ...profileData, ...data })}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
              avatarPreview={avatarPreview}
              onImageChange={handleImageChange}
            />
          ) : (
            <ProfileView
              profileData={profileData}
              userEmail={user?.email}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 