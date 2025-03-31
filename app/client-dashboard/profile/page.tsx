'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  User, Mail, Phone, MapPin, Camera, Building, CreditCard, Lock,
  Bell, Users, Link as LinkIcon, Settings, HelpCircle, Shield,
  ChevronRight, Plus, AlertCircle, Check
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatar: string | null;
  company: {
    name: string;
    address: string;
    website: string;
    industry: string;
  };
  settings: {
    twoFactorEnabled: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      contactVisible: boolean;
    };
  };
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'Account Information',
    icon: <User className="w-5 h-5" />,
    href: '/client-dashboard/profile/account',
    description: 'Manage your personal and company details'
  },
  {
    label: 'Billing & Payments',
    icon: <CreditCard className="w-5 h-5" />,
    href: '/client-dashboard/profile/billing',
    description: 'Payment methods, billing history, and tax info'
  },
  {
    label: 'Security',
    icon: <Lock className="w-5 h-5" />,
    href: '/client-dashboard/profile/security',
    description: 'Password, 2FA, and privacy settings'
  },
  {
    label: 'Team Management',
    icon: <Users className="w-5 h-5" />,
    href: '/client-dashboard/profile/team',
    description: 'Manage team members and permissions'
  },
  {
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    href: '/client-dashboard/profile/notifications',
    description: 'Customize your notification preferences'
  },
  {
    label: 'Connected Services',
    icon: <LinkIcon className="w-5 h-5" />,
    href: '/client-dashboard/profile/services',
    description: 'Manage integrated platforms and API access'
  }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    avatar: null,
    company: {
      name: '',
      address: '',
      website: '',
      industry: ''
    },
    settings: {
      twoFactorEnabled: false,
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        contactVisible: false
      }
    }
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload avatar');

      const data = await response.json();
      setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary to-primary/60">
            <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-4 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <div className="pb-4 flex items-end">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profileData.name || 'Welcome!'}
                  </h1>
                  <p className="text-primary-50">{profileData.title}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {profileData.company.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profileData.location}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Edit Profile
                </button>
                {saveStatus === 'success' && (
                  <span className="text-green-600 flex items-center">
                    <Check className="h-5 w-5 mr-1" />
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-primary">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.label}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions and Stats */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Team Members</div>
                <div className="text-2xl font-semibold text-gray-900">5</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Active Projects</div>
                <div className="text-2xl font-semibold text-gray-900">12</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* Activity items would go here */}
              <div className="text-sm text-gray-500">No recent activity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Need Help?</h2>
              <p className="text-sm text-gray-500">Check out our guides and documentation</p>
            </div>
          </div>
          <Link
            href="/help"
            className="text-primary hover:text-primary/90 text-sm font-medium"
          >
            View Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}