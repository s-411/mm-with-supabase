'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to daily page - no login needed
    router.push('/daily');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mm-blue mx-auto mb-4"></div>
        <p className="text-mm-gray">Redirecting...</p>
      </div>
    </div>
  );
}