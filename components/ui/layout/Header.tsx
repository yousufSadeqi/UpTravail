'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, ArrowUpRight, Bell, Settings, ChevronDown, LogOut, User, BarChart2, Package } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-lightGray">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 bg-primary rounded-md flex items-center justify-center overflow-hidden">
              <ArrowUpRight 
                className="w-4 h-4 text-white group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" 
                strokeWidth={2.5}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-transparent to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Up</span>
              <span className="text-textColor">Travail</span>
              <span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2 w-64 border border-lightGray rounded-full text-sm focus:outline-none focus:border-primary text-black"
              />
            </div>
            <Link 
              href="/browse-services" 
              className="text-textColor hover:text-primary transition-colors"
            >
              Browse Services
            </Link>
            <Link 
              href="/how-it-works" 
              className="text-textColor hover:text-primary transition-colors"
            >
              How it Works
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative text-gray-600 hover:text-primary">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Your Name</p>
                        <p className="text-xs text-gray-500">Online for messages</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
                          Your profile
                        </Link>
                        <Link
                          href="/stats"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BarChart2 className="w-4 h-4" />
                          Stats and trends
                        </Link>
                        <Link
                          href="/membership"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Package className="w-4 h-4" />
                          Membership plan
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-textColor hover:text-primary transition-colors">
                  Log In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-textColor" />
            ) : (
              <Menu className="w-6 h-6 text-textColor" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-lightGray rounded-full text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <nav className="flex flex-col gap-4">
              <Link 
                href="/browse-services" 
                className="text-textColor hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Services
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-textColor hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <hr className="border-lightGray my-2" />
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => useAuth().logout()} 
                    className="text-textColor hover:text-primary transition-colors"
                  >
                    Log Out
                  </button>
                  <Link href="/post-job" className="btn-outline text-center">
                    Post a Job
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-textColor hover:text-primary transition-colors">
                    Log In
                  </Link>
                  <Link href="/auth/register" className="btn-primary text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 