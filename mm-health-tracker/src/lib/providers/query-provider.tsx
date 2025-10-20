'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * QueryProvider - Wraps the app with TanStack Query client
 *
 * Configuration optimized for:
 * - Fast perceived performance with optimistic updates
 * - Automatic background refetching to keep data fresh
 * - Reasonable cache times to reduce unnecessary requests
 * - Single retry on failure for better UX
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance per component tree to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 5 minutes
            staleTime: 1000 * 60 * 5,

            // Keep unused data in cache for 10 minutes (formerly cacheTime)
            gcTime: 1000 * 60 * 10,

            // Retry failed requests once before showing error
            retry: 1,

            // Refetch when user returns to the window/tab
            refetchOnWindowFocus: true,

            // Refetch when network reconnects
            refetchOnReconnect: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only render in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
