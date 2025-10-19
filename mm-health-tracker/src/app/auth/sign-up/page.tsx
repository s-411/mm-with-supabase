'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // If we have a session, email confirmation is disabled - redirect immediately
      if (data.session) {
        router.push('/');
        return;
      }

      // If no session but user was created, email confirmation is enabled
      if (data.user && !data.session) {
        setSuccess(true);
        return;
      }

      // Shouldn't reach here, but just in case
      router.push('/auth/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
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
              <div className="mb-4 text-4xl">✅</div>
              <h1 className="text-2xl font-bold text-mm-white mb-4">
                Check Your Email
              </h1>
              <p className="text-mm-gray mb-6">
                We've sent you a confirmation email. Please click the link in the email to verify your account.
              </p>
              <Link
                href="/auth/sign-in"
                className="inline-block py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 text-white rounded font-medium transition-colors"
              >
                Go to Sign In
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
          <h1 className="text-2xl font-bold text-mm-white mb-6 text-center">
            Create Your Account
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-mm-white mb-2">
                Password
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
              />
              <p className="mt-1 text-xs text-mm-gray">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-mm-white mb-2">
                Confirm Password
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
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 disabled:bg-mm-gray/20 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-mm-gray">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-mm-blue hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
