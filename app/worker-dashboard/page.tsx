'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Home, Briefcase, Search, MessageSquare, Bell, 
  User, ChevronDown, DollarSign, Star, Settings, Menu 
} from 'lucide-react';
import ProfileSection from '@/components/dashboard/ProfileSection';
import JobListings from '@/components/dashboard/JobListings';
import ReviewsSection from '@/components/dashboard/ReviewsSection';
import EarningsSection from '@/components/dashboard/EarningsSection';
import MessagesSection from '@/components/dashboard/MessagesSection';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  count?: number;
}

export default function WorkerDashboard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const menuItems: MenuItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs', href: '/my-jobs', count: 3 },
    { icon: <Search className="w-5 h-5" />, label: 'Find Jobs', href: '/find-jobs' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', href: '/earnings' },
    { icon: <Star className="w-5 h-5" />, label: 'Reviews', href: '/reviews' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                  activeSection === item.label.toLowerCase()
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-600 hover:text-gray-900">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                3
              </span>
            </button>
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                2
              </span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">$12,450</p>
              <span className="text-sm text-green-500">+12% from last month</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Jobs Completed</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">24</p>
              <span className="text-sm text-gray-500">This month</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">98%</p>
              <span className="text-sm text-green-500">+2% from last month</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Proposals</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">5</p>
              <span className="text-sm text-gray-500">Pending review</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-6">
              <button 
                className={`pb-4 text-sm font-medium border-b-2 ${
                  activeSection === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSection('dashboard')}
              >
                Overview
              </button>
              <button 
                className={`pb-4 text-sm font-medium border-b-2 ${
                  activeSection === 'jobs'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSection('jobs')}
              >
                Available Jobs
              </button>
              <button 
                className={`pb-4 text-sm font-medium border-b-2 ${
                  activeSection === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSection('profile')}
              >
                Profile
              </button>
              <button 
                className={`pb-4 text-sm font-medium border-b-2 ${
                  activeSection === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSection('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`pb-4 text-sm font-medium border-b-2 ${
                  activeSection === 'messages'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveSection('messages')}
              >
                Messages
              </button>
            </nav>
          </div>

          {/* Content based on active section */}
          {activeSection === 'dashboard' && (
            <div className="grid gap-6 md:grid-cols-4 mb-6">
              {/* Quick stats content */}
            </div>
          )}
          {activeSection === 'jobs' && <JobListings />}
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'reviews' && <ReviewsSection />}
          {activeSection === 'earnings' && <EarningsSection />}
          {activeSection === 'messages' && <MessagesSection />}
        </div>
      </main>
    </div>
  );
} 