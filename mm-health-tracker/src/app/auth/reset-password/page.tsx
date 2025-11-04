'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setValidToken(!!session);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // Success! Redirect to sign in
      router.push('/auth/sign-in?message=Password updated successfully');
    } catch (err) {
      console.error('Password reset failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking token
  if (validToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mm-dark">
        <div className="text-mm-white">Loading...</div>
      </div>
    );
  }

  // Show error if token is invalid
  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mm-dark">
        <div className="w-full max-w-md">
          <div className="bg-mm-dark2 border border-mm-gray/20 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-mm-white mb-4">
                Invalid or Expired Link
              </h1>
              <p className="text-mm-gray mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-block w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 text-white rounded font-medium transition-colors text-center"
              >
                Request New Link
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
            Reset Your Password
          </h1>
          <p className="text-sm text-mm-gray mb-6 text-center">
            Enter your new password below.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-mm-white mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-mm-dark border border-mm-gray/20 rounded text-mm-white focus:ring-2 focus:ring-mm-blue focus:outline-none"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-mm-white mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-mm-dark border border-mm-gray/20 rounded text-mm-white focus:ring-2 focus:ring-mm-blue focus:outline-none"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 disabled:bg-mm-gray/20 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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
