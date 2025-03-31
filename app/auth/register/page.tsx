'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, X, Check } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuth from '@/components/auth/SocialAuth';
import { supabase } from '@/lib/supabase';
import { isValidEmail } from '@/lib/utils/validation';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'freelancer' | 'client';
}

interface EmailValidation {
  isValid: boolean;
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    isValid: true,
    message: ''
  });
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const validateEmail = (email: string): EmailValidation => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    
    if (!isValidEmail(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Check for common disposable email domains
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'temp-mail.org'];
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
      return { isValid: false, message: 'Please use a valid non-disposable email address' };
    }

    return { isValid: true, message: '' };
  };

  const checkEmailExists = async (email: string) => {
    setIsCheckingEmail(true);
    try {
      const { data, error } = await supabase.from('users').select('id').eq('email', email).single();
      if (error) throw error;
      if (data) {
        setEmailExists(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check email');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        login();
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Full Name
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => {
                const email = e.target.value;
                setFormData({ ...formData, email });
                setEmailExists(false);
                setEmailValidation(validateEmail(email));
              }}
              onBlur={(e) => {
                const email = e.target.value;
                setEmailValidation(validateEmail(email));
                if (emailValidation.isValid) {
                  checkEmailExists(email);
                }
              }}
              className={`block w-full pl-10 pr-10 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm ${
                !emailValidation.isValid || emailExists
                  ? 'border-red-300 focus:border-red-500'
                  : formData.email && emailValidation.isValid
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-300 focus:border-primary'
              }`}
              placeholder="Enter your email address"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isCheckingEmail ? (
                <div className="animate-spin h-5 w-5 text-gray-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
              ) : !emailValidation.isValid ? (
                <X className="h-5 w-5 text-red-500" />
              ) : emailExists ? (
                <X className="h-5 w-5 text-red-500" />
              ) : formData.email && emailValidation.isValid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          </div>
          {!emailValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">
              {emailValidation.message}
            </p>
          )}
          {emailExists && emailValidation.isValid && (
            <p className="mt-1 text-sm text-red-600">
              This email is already registered. Please use a different email or{' '}
              <Link href="/auth/login" className="font-medium underline">
                sign in
              </Link>
              .
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm"
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'client' })}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                formData.role === 'client'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Hire for a Project
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'freelancer' })}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                formData.role === 'freelancer'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Work as a Professional
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-6">
        <SocialAuth />
      </div>
    </AuthLayout>
  );
} 