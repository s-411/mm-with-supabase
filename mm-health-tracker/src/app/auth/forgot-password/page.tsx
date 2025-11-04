'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://measuredmanaged.app/auth/reset-password',
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mm-dark">
        <div className="w-full max-w-md">
          <div className="bg-mm-dark2 border border-mm-gray/20 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-mm-white mb-4">
                Check Your Email
              </h1>
              <p className="text-mm-gray mb-6">
                We've sent a password reset link to <strong className="text-mm-white">{email}</strong>.
                Click the link in the email to reset your password.
              </p>
              <p className="text-sm text-mm-gray mb-6">
                If you don't see the email, check your spam folder.
              </p>
              <Link
                href="/auth/sign-in"
                className="inline-block w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 text-white rounded font-medium transition-colors text-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-dark">
      <div className="w-full max-w-md">
        <div className="bg-mm-dark2 border border-mm-gray/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-mm-white mb-2 text-center">
            Forgot Password?
          </h1>
          <p className="text-sm text-mm-gray mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-mm-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 bg-mm-dark border border-mm-gray/20 rounded text-mm-white focus:ring-2 focus:ring-mm-blue focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 disabled:bg-mm-gray/20 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-mm-gray">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="text-mm-blue hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
