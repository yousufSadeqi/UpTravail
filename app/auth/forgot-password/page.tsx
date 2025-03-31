'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      // TODO: Implement actual password reset logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError('Failed to send reset link. Please try again.');
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <>
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/90">
            Sign in
          </Link>
        </>
      }
    >
      {status === 'success' ? (
        <div className="text-center">
          <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
            Reset link sent! Check your email.
          </div>
          <p className="text-gray-600 mb-4">
            We've sent a password reset link to your email address.
          </p>
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary/90 font-medium"
          >
            Return to login
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
} 