'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to daily page
    router.push('/daily');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-mm-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mm-blue mx-auto mb-4"></div>
        <p className="text-mm-gray">Loading MM Health...</p>
      </div>
    </div>
  );
}