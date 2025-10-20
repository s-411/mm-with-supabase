import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { DailyService } from '@/lib/services/daily.service';
import { ProfileService } from '@/lib/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import type { Database } from '@/lib/supabase/database.types';

type InjectionEntry = Database['public']['Tables']['injection_entries']['Row'];
type InjectionEntryInsert = Database['public']['Tables']['injection_entries']['Insert'];

/**
 * Helper to get DailyService instance
 */
async function getDailyService(userId: string): Promise<DailyService> {
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);
  if (!profile) throw new Error('Profile not found');
  return new DailyService(supabase, profile.id);
}

// ============================================
// QUERY HOOK - Fetches injection entries
// ============================================

/**
 * Hook for managing injection entries within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export function useInjections(startDate: string, endDate: string) {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.injections.byDateRange(startDate, endDate),
    queryFn: async (): Promise<InjectionEntry[]> => {
      if (!user?.id) throw new Error('Not authenticated');

      const dailyService = await getDailyService(user.id);
      return dailyService.getInjectionEntries(startDate, endDate);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    injections: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

// ============================================
// MUTATION HOOKS - Injection Operations
// ============================================

/**
 * Add an injection entry with optimistic update
 */
export function useAddInjection(startDate: string, endDate: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async ({
      date,
      entry,
    }: {
      date: string;
      entry: Omit<InjectionEntryInsert, 'user_id' | 'date'>;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.addInjectionEntry(date, entry);
    },

    onMutate: async ({ date, entry }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.injections.byDateRange(startDate, endDate),
      });
      const previous = queryClient.getQueryData<InjectionEntry[]>(
        queryKeys.injections.byDateRange(startDate, endDate)
      );

      queryClient.setQueryData<InjectionEntry[]>(
        queryKeys.injections.byDateRange(startDate, endDate),
        (old) => {
          const newInjection: InjectionEntry = {
            ...entry,
            id: `temp-${Date.now()}`,
            date,
            profile_id: user?.id ?? '',
            created_at: new Date().toISOString(),
          } as InjectionEntry;

          return [newInjection, ...(old ?? [])];
        }
      );

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.injections.byDateRange(startDate, endDate),
          context.previous
        );
      }
      console.error('Failed to add injection:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.injections.byDateRange(startDate, endDate),
      });
      // Also invalidate daily queries that might include this injection
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.all });
    },
  });
}

/**
 * Delete an injection entry with optimistic update
 */
export function useDeleteInjection(startDate: string, endDate: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entryId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      await dailyService.deleteInjectionEntry(entryId);
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.injections.byDateRange(startDate, endDate),
      });
      const previous = queryClient.getQueryData<InjectionEntry[]>(
        queryKeys.injections.byDateRange(startDate, endDate)
      );

      queryClient.setQueryData<InjectionEntry[]>(
        queryKeys.injections.byDateRange(startDate, endDate),
        (old) => (old ?? []).filter((inj) => inj.id !== entryId)
      );

      return { previous };
    },

    onError: (err, entryId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.injections.byDateRange(startDate, endDate),
          context.previous
        );
      }
      console.error('Failed to delete injection:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.injections.byDateRange(startDate, endDate),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.all });
    },
  });
}
