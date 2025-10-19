'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to settings page
    router.replace('/settings');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-mm-gray">Redirecting to Settings...</div>
    </div>
  );
}