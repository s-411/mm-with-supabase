import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { DailyService } from '@/lib/services/daily.service';
import { ProfileService } from '@/lib/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import type { Database } from '@/lib/supabase/database.types';

type DailyEntry = Database['public']['Tables']['daily_entries']['Row'];
type CalorieEntry = Database['public']['Tables']['calorie_entries']['Row'];
type ExerciseEntry = Database['public']['Tables']['exercise_entries']['Row'];
type MITEntry = Database['public']['Tables']['mit_entries']['Row'];

interface DailyData {
  entry: DailyEntry | null;
  calories: CalorieEntry[];
  exercises: ExerciseEntry[];
  mits: MITEntry[];
}

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
// QUERY HOOK - Fetches daily data
// ============================================

/**
 * Fetch all daily data for a specific date
 */
export function useDaily(date: string) {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.daily.byDate(date),
    queryFn: async (): Promise<DailyData> => {
      if (!user?.id) throw new Error('Not authenticated');

      const dailyService = await getDailyService(user.id);
      const [entry, calories, exercises, mits] = await Promise.all([
        dailyService.getByDate(date),
        dailyService.getCalorieEntries(date),
        dailyService.getExerciseEntries(date),
        dailyService.getMITs(date),
      ]);

      return { entry, calories, exercises, mits };
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 2, // 2 minutes - daily data changes frequently
  });

  return {
    entry: data?.entry ?? null,
    calories: data?.calories ?? [],
    exercises: data?.exercises ?? [],
    mits: data?.mits ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

// ============================================
// MUTATION HOOKS - Calorie Entries
// ============================================

/**
 * Add a calorie entry with optimistic update
 */
export function useAddCalorieEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entry: {
      food_name: string;
      calories: number;
      carbs?: number;
      protein?: number;
      fat?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.addCalorieEntry(date, entry);
    },

    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });

      // Snapshot previous value
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      // Optimistically update
      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          calories: [
            ...old.calories,
            {
              ...newEntry,
              id: `temp-${Date.now()}`,
              date,
              profile_id: user?.id ?? '',
              created_at: new Date().toISOString(),
            } as CalorieEntry,
          ],
        };
      });

      return { previous };
    },

    onError: (err, newEntry, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to add calorie entry:', err);
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
      // Also invalidate range queries that might include this date
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.range });
    },
  });
}

/**
 * Delete a calorie entry with optimistic update
 */
export function useDeleteCalorieEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entryId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      await dailyService.deleteCalorieEntry(entryId);
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          calories: old.calories.filter((c) => c.id !== entryId),
        };
      });

      return { previous };
    },

    onError: (err, entryId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to delete calorie entry:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.range });
    },
  });
}

// ============================================
// MUTATION HOOKS - Exercise Entries
// ============================================

/**
 * Add an exercise entry with optimistic update
 */
export function useAddExerciseEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entry: {
      exercise_type: string;
      duration_minutes: number;
      calories_burned: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.addExerciseEntry(date, entry);
    },

    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: [
            ...old.exercises,
            {
              ...newEntry,
              id: `temp-${Date.now()}`,
              date,
              profile_id: user?.id ?? '',
              created_at: new Date().toISOString(),
            } as ExerciseEntry,
          ],
        };
      });

      return { previous };
    },

    onError: (err, newEntry, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to add exercise entry:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.range });
    },
  });
}

/**
 * Delete an exercise entry with optimistic update
 */
export function useDeleteExerciseEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entryId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      await dailyService.deleteExerciseEntry(entryId);
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: old.exercises.filter((e) => e.id !== entryId),
        };
      });

      return { previous };
    },

    onError: (err, entryId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to delete exercise entry:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.range });
    },
  });
}

// ============================================
// MUTATION HOOKS - Daily Entry
// ============================================

/**
 * Update weight with optimistic update
 */
export function useUpdateWeight(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (weight: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.updateWeight(date, weight);
    },

    onMutate: async (weight) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          entry: old.entry
            ? { ...old.entry, weight }
            : null,
        };
      });

      return { previous };
    },

    onError: (err, weight, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to update weight:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.range });
    },
  });
}

/**
 * Toggle deep work completion with optimistic update
 */
export function useToggleDeepWork(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.toggleDeepWork(date);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old || !old.entry) return old;
        return {
          ...old,
          entry: {
            ...old.entry,
            deep_work_completed: !old.entry.deep_work_completed,
          },
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to toggle deep work:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
    },
  });
}

// ============================================
// MUTATION HOOKS - MIT Entries
// ============================================

/**
 * Add a MIT with optimistic update
 */
export function useAddMIT(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async ({ taskDescription, orderIndex = 0 }: { taskDescription: string; orderIndex?: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.addMIT(date, taskDescription, orderIndex);
    },

    onMutate: async ({ taskDescription, orderIndex = 0 }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          mits: [
            ...old.mits,
            {
              id: `temp-${Date.now()}`,
              date,
              profile_id: user?.id ?? '',
              task_description: taskDescription,
              completed: false,
              order_index: orderIndex,
              created_at: new Date().toISOString(),
            } as MITEntry,
          ],
        };
      });

      return { previous };
    },

    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to add MIT:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
    },
  });
}

/**
 * Toggle MIT completion with optimistic update
 */
export function useToggleMIT(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (mitId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      return dailyService.toggleMIT(mitId);
    },

    onMutate: async (mitId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          mits: old.mits.map((m) =>
            m.id === mitId ? { ...m, completed: !m.completed } : m
          ),
        };
      });

      return { previous };
    },

    onError: (err, mitId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to toggle MIT:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
    },
  });
}

/**
 * Delete a MIT with optimistic update
 */
export function useDeleteMIT(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (mitId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const dailyService = await getDailyService(user.id);
      await dailyService.deleteMIT(mitId);
    },

    onMutate: async (mitId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.daily.byDate(date) });
      const previous = queryClient.getQueryData<DailyData>(queryKeys.daily.byDate(date));

      queryClient.setQueryData<DailyData>(queryKeys.daily.byDate(date), (old) => {
        if (!old) return old;
        return {
          ...old,
          mits: old.mits.filter((m) => m.id !== mitId),
        };
      });

      return { previous };
    },

    onError: (err, mitId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.daily.byDate(date), context.previous);
      }
      console.error('Failed to delete MIT:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.daily.byDate(date) });
    },
  });
}

// ============================================
// RANGE QUERY - For analytics/history
// ============================================

interface DailyRangeData {
  entries: DailyEntry[];
  calories: CalorieEntry[];
  exercises: ExerciseEntry[];
}

/**
 * Fetch data across a date range for analytics
 */
export function useDailyRange(startDate: string, endDate: string) {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.daily.range(startDate, endDate),
    queryFn: async (): Promise<DailyRangeData> => {
      if (!user?.id) throw new Error('Not authenticated');

      const dailyService = await getDailyService(user.id);
      const [entries, calories, exercises] = await Promise.all([
        dailyService.getRange(startDate, endDate),
        dailyService.getCalorieEntriesRange(startDate, endDate),
        dailyService.getExerciseEntriesRange(startDate, endDate),
      ]);

      return { entries, calories, exercises };
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 5, // 5 minutes - range data doesn't change as frequently
  });

  return {
    entries: data?.entries ?? [],
    calories: data?.calories ?? [],
    exercises: data?.exercises ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}
