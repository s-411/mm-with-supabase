'use client';

import React from 'react';
import { AppShell } from '@/components/Navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  // All routes use AppShell (no auth protection needed)
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}