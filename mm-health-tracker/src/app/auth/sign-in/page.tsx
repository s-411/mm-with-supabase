'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting sign-in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign-in response:', { data, error });

      if (error) {
        console.error('Sign-in error:', error);
        throw error;
      }

      if (data.session) {
        console.log('Session established, redirecting...');
        // Wait a moment for session to propagate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Force refresh and redirect
        router.push('/');
        router.refresh();
      } else {
        console.error('No session in response');
        setError('Failed to establish session. Please try again.');
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-dark">
      <div className="w-full max-w-md">
        <div className="bg-mm-dark2 border border-mm-gray/20 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-mm-white mb-6 text-center">
            Sign In to MM Health Tracker
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-mm-white">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-mm-blue hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-mm-dark border border-mm-gray/20 rounded text-mm-white focus:ring-2 focus:ring-mm-blue focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-mm-blue hover:bg-mm-blue/80 disabled:bg-mm-gray/20 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-mm-gray">
            Don't have an account?{' '}
            <Link href="/auth/sign-up" className="text-mm-blue hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
