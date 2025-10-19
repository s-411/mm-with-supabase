'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/Navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide navigation on authentication pages
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}