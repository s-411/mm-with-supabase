import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { WeeklyService } from '@/lib/services/weekly.service';
import { ProfileService } from '@/lib/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import type { Database } from '@/lib/supabase/database.types';

type WeeklyEntry = Database['public']['Tables']['weekly_entries']['Row'];

export interface WeeklyObjective {
  id: string;
  objective: string;
  completed: boolean;
  order: number;
}

/**
 * Helper to get WeeklyService instance
 */
async function getWeeklyService(userId: string): Promise<WeeklyService> {
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);
  if (!profile) throw new Error('Profile not found');
  return new WeeklyService(supabase, profile.id);
}

/**
 * Parse objectives from JSONB to typed array
 */
function parseObjectives(entry: WeeklyEntry | null): WeeklyObjective[] {
  if (!entry?.objectives) return [];
  return (entry.objectives as any[]).map((obj: any) => ({
    id: obj.id,
    objective: obj.objective,
    completed: obj.completed,
    order: obj.order,
  }));
}

// ============================================
// QUERY HOOK - Fetches weekly data
// ============================================

/**
 * Hook for managing weekly objectives and reviews
 * @param weekStartDate - Monday's date in YYYY-MM-DD format
 */
export function useWeekly(weekStartDate: string) {
  const { user } = useApp();

  const { data: entry, isLoading, error } = useQuery({
    queryKey: queryKeys.weekly.byWeek(weekStartDate),
    queryFn: async (): Promise<WeeklyEntry | null> => {
      if (!user?.id) throw new Error('Not authenticated');

      const weeklyService = await getWeeklyService(user.id);
      return weeklyService.getByWeekStart(weekStartDate);
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const objectives = parseObjectives(entry ?? null);

  return {
    entry: entry ?? null,
    objectives,
    whyImportant: entry?.why_important ?? null,
    fridayReview: entry?.friday_review ?? null,
    reviewCompleted: entry?.review_completed ?? false,
    loading: isLoading,
    error: error?.message ?? null,
  };
}

// ============================================
// MUTATION HOOKS - Weekly Operations
// ============================================

/**
 * Update weekly objectives with optimistic update
 */
export function useUpdateWeeklyObjectives(weekStartDate: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async ({
      objectives,
      whyImportant,
    }: {
      objectives: WeeklyObjective[];
      whyImportant: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const weeklyService = await getWeeklyService(user.id);
      return weeklyService.upsert(weekStartDate, {
        objectives: objectives as any,
        why_important: whyImportant,
      });
    },

    onMutate: async ({ objectives, whyImportant }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
      const previous = queryClient.getQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate));

      queryClient.setQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate), (old) => {
        if (!old) {
          // Create a temporary entry if none exists
          return {
            id: `temp-${Date.now()}`,
            week_start: weekStartDate,
            profile_id: user?.id ?? '',
            objectives: objectives as any,
            why_important: whyImportant,
            friday_review: null,
            review_completed: false,
            created_at: new Date().toISOString(),
          } as WeeklyEntry;
        }
        return {
          ...old,
          objectives: objectives as any,
          why_important: whyImportant,
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.weekly.byWeek(weekStartDate), context.previous);
      }
      console.error('Failed to update objectives:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
    },
  });
}

/**
 * Toggle objective completion with optimistic update
 */
export function useToggleWeeklyObjective(weekStartDate: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (objectiveId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const weeklyService = await getWeeklyService(user.id);
      return weeklyService.toggleObjectiveCompletion(weekStartDate, objectiveId);
    },

    onMutate: async (objectiveId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
      const previous = queryClient.getQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate));

      queryClient.setQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate), (old) => {
        if (!old || !old.objectives) return old;

        const updatedObjectives = (old.objectives as any[]).map((obj: any) =>
          obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
        );

        return {
          ...old,
          objectives: updatedObjectives as any,
        };
      });

      return { previous };
    },

    onError: (err, objectiveId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.weekly.byWeek(weekStartDate), context.previous);
      }
      console.error('Failed to toggle objective:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
    },
  });
}

/**
 * Update Friday review with optimistic update
 */
export function useUpdateFridayReview(weekStartDate: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (review: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const weeklyService = await getWeeklyService(user.id);
      return weeklyService.updateFridayReview(weekStartDate, review);
    },

    onMutate: async (review) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
      const previous = queryClient.getQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate));

      queryClient.setQueryData<WeeklyEntry>(queryKeys.weekly.byWeek(weekStartDate), (old) => {
        if (!old) return old;
        return {
          ...old,
          friday_review: review,
          review_completed: true,
        };
      });

      return { previous };
    },

    onError: (err, review, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.weekly.byWeek(weekStartDate), context.previous);
      }
      console.error('Failed to update Friday review:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weekly.byWeek(weekStartDate) });
    },
  });
}
