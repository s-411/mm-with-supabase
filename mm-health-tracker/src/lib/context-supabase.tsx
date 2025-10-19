'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProfileService } from '@/lib/services/profile.service';
import { DailyService } from '@/lib/services/daily.service';
import type { Database } from '@/lib/supabase/database.types';
import type { User, Session } from '@supabase/supabase-js';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AppState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const loadProfile = async (userId: string) => {
    try {
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

      setState(prev => ({ ...prev, profile, isLoading: false, error: null }));
    } catch (error) {
      console.error('Error loading profile:', error);
      setState(prev => ({
        ...prev,
        profile: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile',
      }));
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        isLoading: !!session?.user // Only loading if we have a user
      }));

      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        isLoading: !!session?.user // Only loading if we have a user
      }));

      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setState({ user: null, session: null, profile: null, isLoading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (state.user) {
      await loadProfile(state.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ ...state, refreshProfile, signOut }}>
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

  const updateProfile = async (updates: Partial<Database['public']['Tables']['user_profiles']['Update']>) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const profileService = new ProfileService(supabase);
    await profileService.update(user.id, updates);
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
  const [isLoading, setIsLoading] = useState(false);

  const getDailyService = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to get the user_id UUID
    const profileService = new ProfileService(supabase);
    const profile = await profileService.get(user.id);

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
