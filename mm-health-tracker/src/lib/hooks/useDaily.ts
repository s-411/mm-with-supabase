import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { DailyService } from '@/lib/services/daily.service';
import { ProfileService } from '@/lib/services/profile.service';
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

export function useDaily(date: string) {
  const { getToken, userId } = useAuth();
  const [data, setData] = useState<DailyData>({
    entry: null,
    calories: [],
    exercises: [],
    mits: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDailyService = useCallback(async () => {
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const profileService = new ProfileService(supabase);
    const profile = await profileService.get(userId);

    if (!profile) throw new Error('Profile not found');

    return new DailyService(supabase, profile.id);
  }, [getToken, userId]);

  const loadDailyData = useCallback(async () => {
    if (!userId) {
      setData({ entry: null, calories: [], exercises: [], mits: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dailyService = await getDailyService();
      const [entry, calories, exercises, mits] = await Promise.all([
        dailyService.getByDate(date),
        dailyService.getCalorieEntries(date),
        dailyService.getExerciseEntries(date),
        dailyService.getMITs(date),
      ]);

      setData({ entry, calories, exercises, mits });
    } catch (err) {
      console.error('Error loading daily data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load daily data');
    } finally {
      setLoading(false);
    }
  }, [date, getDailyService, userId]);

  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // ============================================
  // CALORIE ENTRY METHODS
  // ============================================

  const addCalorieEntry = useCallback(async (entry: {
    food_name: string;
    calories: number;
    carbs?: number;
    protein?: number;
    fat?: number;
  }) => {
    try {
      const dailyService = await getDailyService();
      const newEntry = await dailyService.addCalorieEntry(date, entry);

      setData(prev => ({
        ...prev,
        calories: [...prev.calories, newEntry],
      }));

      return newEntry;
    } catch (err) {
      console.error('Error adding calorie entry:', err);
      throw err;
    }
  }, [date, getDailyService]);

  const removeCalorieEntry = useCallback(async (entryId: string) => {
    try {
      const dailyService = await getDailyService();
      await dailyService.deleteCalorieEntry(entryId);

      setData(prev => ({
        ...prev,
        calories: prev.calories.filter(c => c.id !== entryId),
      }));
    } catch (err) {
      console.error('Error removing calorie entry:', err);
      throw err;
    }
  }, [getDailyService]);

  // ============================================
  // EXERCISE ENTRY METHODS
  // ============================================

  const addExerciseEntry = useCallback(async (entry: {
    exercise_type: string;
    duration_minutes: number;
    calories_burned: number;
  }) => {
    try {
      const dailyService = await getDailyService();
      const newEntry = await dailyService.addExerciseEntry(date, entry);

      setData(prev => ({
        ...prev,
        exercises: [...prev.exercises, newEntry],
      }));

      return newEntry;
    } catch (err) {
      console.error('Error adding exercise entry:', err);
      throw err;
    }
  }, [date, getDailyService]);

  const removeExerciseEntry = useCallback(async (entryId: string) => {
    try {
      const dailyService = await getDailyService();
      await dailyService.deleteExerciseEntry(entryId);

      setData(prev => ({
        ...prev,
        exercises: prev.exercises.filter(e => e.id !== entryId),
      }));
    } catch (err) {
      console.error('Error removing exercise entry:', err);
      throw err;
    }
  }, [getDailyService]);

  // ============================================
  // DAILY ENTRY METHODS
  // ============================================

  const updateWeight = useCallback(async (weight: number) => {
    try {
      const dailyService = await getDailyService();
      const updatedEntry = await dailyService.updateWeight(date, weight);

      setData(prev => ({
        ...prev,
        entry: updatedEntry,
      }));

      return updatedEntry;
    } catch (err) {
      console.error('Error updating weight:', err);
      throw err;
    }
  }, [date, getDailyService]);

  const toggleDeepWork = useCallback(async () => {
    try {
      const dailyService = await getDailyService();
      const updatedEntry = await dailyService.toggleDeepWork(date);

      setData(prev => ({
        ...prev,
        entry: updatedEntry,
      }));

      return updatedEntry;
    } catch (err) {
      console.error('Error toggling deep work:', err);
      throw err;
    }
  }, [date, getDailyService]);

  // ============================================
  // MIT METHODS
  // ============================================

  const addMIT = useCallback(async (taskDescription: string, orderIndex: number = 0) => {
    try {
      const dailyService = await getDailyService();
      const newMIT = await dailyService.addMIT(date, taskDescription, orderIndex);

      setData(prev => ({
        ...prev,
        mits: [...prev.mits, newMIT],
      }));

      return newMIT;
    } catch (err) {
      console.error('Error adding MIT:', err);
      throw err;
    }
  }, [date, getDailyService]);

  const toggleMIT = useCallback(async (mitId: string) => {
    try {
      const dailyService = await getDailyService();
      const updatedMIT = await dailyService.toggleMIT(mitId);

      setData(prev => ({
        ...prev,
        mits: prev.mits.map(m => m.id === mitId ? updatedMIT : m),
      }));

      return updatedMIT;
    } catch (err) {
      console.error('Error toggling MIT:', err);
      throw err;
    }
  }, [getDailyService]);

  const deleteMIT = useCallback(async (mitId: string) => {
    try {
      const dailyService = await getDailyService();
      await dailyService.deleteMIT(mitId);

      setData(prev => ({
        ...prev,
        mits: prev.mits.filter(m => m.id !== mitId),
      }));
    } catch (err) {
      console.error('Error deleting MIT:', err);
      throw err;
    }
  }, [getDailyService]);

  return {
    // Data
    entry: data.entry,
    calories: data.calories,
    exercises: data.exercises,
    mits: data.mits,
    loading,
    error,

    // Methods
    addCalorieEntry,
    removeCalorieEntry,
    addExerciseEntry,
    removeExerciseEntry,
    updateWeight,
    toggleDeepWork,
    addMIT,
    toggleMIT,
    deleteMIT,
    reload: loadDailyData,
  };
}

// Hook for loading data across a date range (for analytics/history)
export function useDailyRange(startDate: string, endDate: string) {
  const { getToken, userId } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [calories, setCalories] = useState<CalorieEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDailyService = useCallback(async () => {
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const profileService = new ProfileService(supabase);
    const profile = await profileService.get(userId);

    if (!profile) throw new Error('Profile not found');

    return new DailyService(supabase, profile.id);
  }, [getToken, userId]);

  const loadRangeData = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setCalories([]);
      setExercises([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dailyService = await getDailyService();
      const [entriesData, caloriesData, exercisesData] = await Promise.all([
        dailyService.getRange(startDate, endDate),
        dailyService.getCalorieEntriesRange(startDate, endDate),
        dailyService.getExerciseEntriesRange(startDate, endDate),
      ]);

      setEntries(entriesData);
      setCalories(caloriesData);
      setExercises(exercisesData);
    } catch (err) {
      console.error('Error loading range data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load range data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, getDailyService, userId]);

  useEffect(() => {
    loadRangeData();
  }, [loadRangeData]);

  return {
    entries,
    calories,
    exercises,
    loading,
    error,
    reload: loadRangeData,
  };
}
