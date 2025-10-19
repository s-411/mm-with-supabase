'use client';

import React from 'react';
import { AppShell } from '@/components/Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}