'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Briefcase,
  MessageSquare,
  Bell,
  Wallet,
  Settings,
  User,
  Menu,
  X,
  UserCircle,
  Languages,
  HelpCircle,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { signOut } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/client-dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Post a Job', href: '/client-dashboard/post-job', icon: <PlusCircle className="w-5 h-5" /> },
  { label: 'My Jobs', href: '/client-dashboard/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Messages', href: '/client-dashboard/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Wallet', href: '/client-dashboard/wallet', icon: <Wallet className="w-5 h-5" /> },
];

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const { user } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update hasNotifications when notifications change
    setHasNotifications(notifications.some(notification => !notification.read));
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(prev => !prev);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      // Clear any local state/storage if needed
      localStorage.removeItem('user-preferences');
      sessionStorage.clear();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: force redirect to login if signOut fails
      router.push('/auth/login');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Desktop Navigation */}
              <div className="flex">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-primary">Up</span>
                  <span className="text-xl font-bold text-gray-900">Travail</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        pathname === item.href
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-gray-500 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right side items */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={handleNotificationClick}
                    className="relative p-1 text-gray-400 hover:text-gray-500"
                  >
                    <Bell className="h-6 w-6" />
                    {hasNotifications && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 max-h-[400px] overflow-y-auto">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          {notifications.length > 0 && (
                            <span className="text-xs text-gray-500">{notifications.length} new</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-4">
                          {notifications.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-4">
                              No new notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg ${
                                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={handleProfileClick}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 p-2 transition-all duration-300 ease-in-out group"
                    >
                      <div className="relative h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:ring-2 group-hover:ring-primary/20 group-hover:scale-105">
                        <User className="h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-primary transform group-hover:scale-110" />
                      </div>
                      <span className="transition-all duration-300 group-hover:text-gray-900">{user?.name || 'Your Name'}</span>
                    </button>

                    {showProfileMenu && (
                      <div 
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 transform origin-top-right"
                        style={{
                          animation: 'dropdown 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)'
                        }}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
                          <p className="text-sm font-medium text-gray-900 transform transition-all duration-300 hover:scale-[1.02]">{user?.name || 'Your Name'}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/client-dashboard/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 group hover:text-primary"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <UserCircle className="h-4 w-4 mr-2 transition-transform duration-300 ease-spring group-hover:scale-110" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Your Profile</span>
                          </Link>
                          <Link
                            href="/client-dashboard/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 group hover:text-primary"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings className="h-4 w-4 mr-2 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:rotate-90" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Settings</span>
                          </Link>
                          <Link
                            href="/client-dashboard/language"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 group hover:text-primary"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Languages className="h-4 w-4 mr-2 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:rotate-12" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Language</span>
                          </Link>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <Link
                            href="/help"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 group hover:text-primary"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <HelpCircle className="h-4 w-4 mr-2 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:rotate-12" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Help & Support</span>
                          </Link>
                          <Link
                            href="/privacy"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 group hover:text-primary"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Shield className="h-4 w-4 mr-2 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:rotate-12" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Privacy & Security</span>
                          </Link>
                        </div>

                        <div className="py-1 border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 group"
                          >
                            <LogOut className="h-4 w-4 mr-2 transition-all duration-300 ease-spring group-hover:scale-110 group-hover:-translate-x-1" />
                            <span className="transform transition-transform duration-300 ease-spring group-hover:translate-x-0.5">Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block pl-3 pr-4 py-2 text-base font-medium ${
                      pathname === item.href
                        ? 'text-primary bg-primary/5 border-l-4 border-primary'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          {children}
        </main>
      </div>
      <style jsx>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          50% {
            transform: scale(1.02) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .ease-spring {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .group:hover .group-hover\:scale-110 {
          transform: scale(1.1);
        }

        .group:hover .group-hover\:rotate-90 {
          transform: rotate(90deg);
        }

        .group:hover .group-hover\:rotate-12 {
          transform: rotate(12deg);
        }

        .group:hover .group-hover\:-translate-x-1 {
          transform: translateX(-4px);
        }

        .group:hover .group-hover\:translate-x-0\.5 {
          transform: translateX(2px);
        }
      `}</style>
    </>
  );
}