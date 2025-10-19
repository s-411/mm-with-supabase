'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction, UserProfile } from '@/types';
import { profileStorage, dailyEntryStorage, getTodayDateString } from '@/lib/storage';

// Initial state
const initialState: AppState = {
  profile: null,
  currentDate: getTodayDateString(),
  dailyEntries: {},
  isLoading: true,
  error: null
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload
      };

    case 'UPDATE_PROFILE':
      if (!state.profile) return state;
      const updatedProfile = {
        ...state.profile,
        ...action.payload,
        updatedAt: new Date()
      };
      return {
        ...state,
        profile: updatedProfile
      };

    case 'SET_CURRENT_DATE':
      return {
        ...state,
        currentDate: action.payload
      };

    case 'ADD_CALORIE_ENTRY':
      const { date: calorieDate, entry: calorieEntry } = action.payload;
      const currentCalorieEntry = state.dailyEntries[calorieDate] || {
        id: Math.random().toString(36).substr(2, 9),
        date: calorieDate,
        calories: [],
        exercises: [],
        deepWorkCompleted: false,
        injections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        dailyEntries: {
          ...state.dailyEntries,
          [calorieDate]: {
            ...currentCalorieEntry,
            calories: [...currentCalorieEntry.calories, calorieEntry],
            updatedAt: new Date()
          }
        }
      };

    case 'ADD_EXERCISE_ENTRY':
      const { date: exerciseDate, entry: exerciseEntry } = action.payload;
      const currentExerciseEntry = state.dailyEntries[exerciseDate] || {
        id: Math.random().toString(36).substr(2, 9),
        date: exerciseDate,
        calories: [],
        exercises: [],
        deepWorkCompleted: false,
        injections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        dailyEntries: {
          ...state.dailyEntries,
          [exerciseDate]: {
            ...currentExerciseEntry,
            exercises: [...currentExerciseEntry.exercises, exerciseEntry],
            updatedAt: new Date()
          }
        }
      };

    case 'ADD_INJECTION_ENTRY':
      const { date: injectionDate, entry: injectionEntry } = action.payload;
      const currentInjectionEntry = state.dailyEntries[injectionDate] || {
        id: Math.random().toString(36).substr(2, 9),
        date: injectionDate,
        calories: [],
        exercises: [],
        deepWorkCompleted: false,
        injections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        dailyEntries: {
          ...state.dailyEntries,
          [injectionDate]: {
            ...currentInjectionEntry,
            injections: [...currentInjectionEntry.injections, injectionEntry],
            updatedAt: new Date()
          }
        }
      };

    case 'UPDATE_WEIGHT':
      const { date: weightDate, weight } = action.payload;
      const currentWeightEntry = state.dailyEntries[weightDate] || {
        id: Math.random().toString(36).substr(2, 9),
        date: weightDate,
        calories: [],
        exercises: [],
        deepWorkCompleted: false,
        injections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        dailyEntries: {
          ...state.dailyEntries,
          [weightDate]: {
            ...currentWeightEntry,
            weight,
            updatedAt: new Date()
          }
        }
      };

    case 'TOGGLE_DEEP_WORK':
      const { date: deepWorkDate } = action.payload;
      const currentDeepWorkEntry = state.dailyEntries[deepWorkDate] || {
        id: Math.random().toString(36).substr(2, 9),
        date: deepWorkDate,
        calories: [],
        exercises: [],
        deepWorkCompleted: false,
        injections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        ...state,
        dailyEntries: {
          ...state.dailyEntries,
          [deepWorkDate]: {
            ...currentDeepWorkEntry,
            deepWorkCompleted: !currentDeepWorkEntry.deepWorkCompleted,
            updatedAt: new Date()
          }
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'LOAD_DATA':
      return {
        ...state,
        profile: action.payload.profile,
        dailyEntries: action.payload.dailyEntries,
        isLoading: false
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    try {
      const profile = profileStorage.get();
      const dailyEntries = dailyEntryStorage.getAll();

      dispatch({
        type: 'LOAD_DATA',
        payload: { profile, dailyEntries }
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load data'
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Persist data changes to localStorage
  useEffect(() => {
    if (!state.isLoading && state.profile) {
      profileStorage.save(state.profile);
    }
  }, [state.profile, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      Object.values(state.dailyEntries).forEach(entry => {
        dailyEntryStorage.save(entry);
      });
    }
  }, [state.dailyEntries, state.isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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

// Custom hooks for specific functionality
export function useProfile() {
  const { state, dispatch } = useApp();

  const updateProfile = (updates: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const createProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const profile = profileStorage.create(profileData);
    dispatch({ type: 'SET_PROFILE', payload: profile });
    return profile;
  };

  return {
    profile: state.profile,
    updateProfile,
    createProfile,
    isLoading: state.isLoading
  };
}

export function useDailyEntry(date?: string) {
  const { state, dispatch } = useApp();
  const targetDate = date || state.currentDate;
  const entry = state.dailyEntries[targetDate];

  const addCalorieEntry = (calorieData: { name: string; calories: number; carbs: number; protein: number; fat: number }) => {
    const calorieEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...calorieData,
      timestamp: new Date()
    };
    dispatch({
      type: 'ADD_CALORIE_ENTRY',
      payload: { date: targetDate, entry: calorieEntry }
    });
  };

  const addExerciseEntry = (exerciseData: { type: string; duration: number; caloriesBurned: number }) => {
    const exerciseEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...exerciseData,
      timestamp: new Date()
    };
    dispatch({
      type: 'ADD_EXERCISE_ENTRY',
      payload: { date: targetDate, entry: exerciseEntry }
    });
  };

  const addInjectionEntry = (injectionData: { compound: string; dosage: number; unit: string; notes?: string }) => {
    const injectionEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...injectionData,
      timestamp: new Date()
    };
    dispatch({
      type: 'ADD_INJECTION_ENTRY',
      payload: { date: targetDate, entry: injectionEntry }
    });
  };

  const updateWeight = (weight: number) => {
    dispatch({
      type: 'UPDATE_WEIGHT',
      payload: { date: targetDate, weight }
    });
  };

  const toggleDeepWork = () => {
    dispatch({
      type: 'TOGGLE_DEEP_WORK',
      payload: { date: targetDate }
    });
  };

  return {
    entry,
    addCalorieEntry,
    addExerciseEntry,
    addInjectionEntry,
    updateWeight,
    toggleDeepWork
  };
}

export function useHealthMetrics(date?: string) {
  const { state } = useApp();
  const targetDate = date || state.currentDate;
  const entry = state.dailyEntries[targetDate];
  const bmr = state.profile?.bmr || 2000;

  if (!entry) {
    return {
      totalCaloriesConsumed: 0,
      totalCaloriesBurned: 0,
      calorieBalance: bmr,
      macros: { carbs: 0, protein: 0, fat: 0 },
      completionStatus: {
        calories: false,
        exercise: false,
        weight: false,
        deepWork: false
      }
    };
  }

  const totalCaloriesConsumed = entry.calories.reduce((sum, cal) => sum + cal.calories, 0);
  const totalCaloriesBurned = entry.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const calorieBalance = bmr - totalCaloriesConsumed + totalCaloriesBurned;

  const macros = entry.calories.reduce(
    (totals, cal) => ({
      carbs: totals.carbs + cal.carbs,
      protein: totals.protein + cal.protein,
      fat: totals.fat + cal.fat
    }),
    { carbs: 0, protein: 0, fat: 0 }
  );

  const completionStatus = {
    calories: entry.calories.length > 0,
    exercise: entry.exercises.length > 0,
    weight: entry.weight !== undefined,
    deepWork: entry.deepWorkCompleted
  };

  return {
    totalCaloriesConsumed,
    totalCaloriesBurned,
    calorieBalance,
    macros,
    completionStatus
  };
}