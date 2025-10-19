'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/Navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide navigation on Clerk authentication pages
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}