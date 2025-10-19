'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { ProfileService } from '@/lib/services/profile.service';
import { DailyService } from '@/lib/services/daily.service';
import type { Database } from '@/lib/supabase/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AppState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { getToken, userId, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<AppState>({
    profile: null,
    isLoading: true,
    error: null,
  });

  const loadProfile = async () => {
    if (!isAuthLoaded || !userId || !user) {
      setState({ profile: null, isLoading: false, error: null });
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Get Clerk JWT token
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Create authenticated Supabase client
      const supabase = createClerkSupabaseClient(token);
      const profileService = new ProfileService(supabase);

      // Try to get existing profile
      let profile = await profileService.get(userId);

      // If no profile exists, create one
      if (!profile) {
        console.log('Creating new profile for user:', userId);
        profile = await profileService.create(userId, {
          bmr: 2000,
          height: null,
          weight: null,
          gender: null,
          tracker_settings: {},
          macro_targets: {},
        });
      }

      setState({ profile, isLoading: false, error: null });
    } catch (error) {
      console.error('Error loading profile:', error);
      setState({
        profile: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile',
      });
    }
  };

  // Load profile when auth is ready
  useEffect(() => {
    loadProfile();
  }, [isAuthLoaded, userId]);

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <AppContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Hook for profile operations
export function useProfile() {
  const { profile, isLoading, refreshProfile } = useApp();
  const { getToken, userId } = useAuth();

  const updateProfile = async (updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const token = await getToken({ template: 'supabase' });
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const supabase = createClerkSupabaseClient(token);
    const profileService = new ProfileService(supabase);

    await profileService.update(userId, updates);
    await refreshProfile();
  };

  return {
    profile,
    updateProfile,
    refreshProfile,
    isLoading,
  };
}

// Hook for daily entries
export function useDailyEntry(date: string) {
  const { getToken, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getDailyService = async () => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const token = await getToken({ template: 'supabase' });
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const supabase = createClerkSupabaseClient(token);

    // Get user profile to get the user_id UUID
    const profileService = new ProfileService(supabase);
    const profile = await profileService.get(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return new DailyService(supabase, profile.id);
  };

  const addCalorieEntry = async (calorieData: {
    food_name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  }) => {
    setIsLoading(true);
    try {
      const dailyService = await getDailyService();
      await dailyService.addCalorieEntry(date, calorieData);
    } finally {
      setIsLoading(false);
    }
  };

  const addExerciseEntry = async (exerciseData: {
    exercise_type: string;
    duration_minutes: number;
    calories_burned: number;
  }) => {
    setIsLoading(true);
    try {
      const dailyService = await getDailyService();
      await dailyService.addExerciseEntry(date, exerciseData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateWeight = async (weight: number) => {
    setIsLoading(true);
    try {
      const dailyService = await getDailyService();
      await dailyService.updateWeight(date, weight);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDeepWork = async () => {
    setIsLoading(true);
    try {
      const dailyService = await getDailyService();
      await dailyService.toggleDeepWork(date);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addCalorieEntry,
    addExerciseEntry,
    updateWeight,
    toggleDeepWork,
    isLoading,
  };
}
