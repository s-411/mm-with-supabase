'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { NirvanaService } from '@/lib/services/nirvana.service';
import { ProfileService } from '@/lib/services/profile.service';
import { Database } from '@/lib/supabase/database.types';

type NirvanaEntry = Database['public']['Tables']['nirvana_entries']['Row'];
type NirvanaSession = Database['public']['Tables']['nirvana_sessions']['Row'];
type NirvanaMilestone = Database['public']['Tables']['nirvana_milestones']['Row'];
type NirvanaPersonalRecord = Database['public']['Tables']['nirvana_personal_records']['Row'];
type BodyPartMapping = Database['public']['Tables']['body_part_mappings']['Row'];

async function getNirvanaService(getToken: any, userId: string): Promise<NirvanaService> {
  if (!userId) throw new Error('Not authenticated');

  const token = await getToken({ template: 'supabase' });
  if (!token) throw new Error('No auth token');

  const supabase = createClerkSupabaseClient(token);
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new NirvanaService(supabase, profile.id);
}

// Hook for managing daily Nirvana sessions
export function useNirvanaSessions(date: string) {
  const { getToken, userId } = useAuth();
  const [entry, setEntry] = useState<NirvanaEntry | null>(null);
  const [sessions, setSessions] = useState<NirvanaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setEntry(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nirvanaService = await getNirvanaService(getToken, userId);
      const data = await nirvanaService.getByDate(date);
      setEntry(data.entry);
      setSessions(data.sessions);
      setError(null);
    } catch (err) {
      console.error('Error loading nirvana sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load nirvana sessions');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId, date]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const addSession = useCallback(async (sessionType: string) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    const newSession = await nirvanaService.addSession(date, sessionType);
    await loadSessions(); // Reload to get updated counts
    return newSession;
  }, [getToken, userId, date, loadSessions]);

  const removeSession = useCallback(async (sessionId: string) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    await nirvanaService.removeSession(sessionId);
    await loadSessions(); // Reload to get updated counts
  }, [getToken, userId, loadSessions]);

  return {
    entry,
    sessions,
    loading,
    error,
    addSession,
    removeSession,
    reload: loadSessions
  };
}

// Hook for managing weekly Nirvana data
export function useNirvanaWeekly(weekStart: string) {
  const { getToken, userId } = useAuth();
  const [weeklyData, setWeeklyData] = useState<{ [date: string]: { entry: NirvanaEntry | null; sessions: NirvanaSession[] } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeeklyData = useCallback(async () => {
    if (!userId) {
      setWeeklyData({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nirvanaService = await getNirvanaService(getToken, userId);
      const data = await nirvanaService.getWeeklyData(weekStart);
      setWeeklyData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading weekly nirvana data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId, weekStart]);

  useEffect(() => {
    loadWeeklyData();
  }, [loadWeeklyData]);

  return {
    weeklyData,
    loading,
    error,
    reload: loadWeeklyData
  };
}

// Hook for managing milestones
export function useNirvanaMilestones() {
  const { getToken, userId } = useAuth();
  const [milestones, setMilestones] = useState<NirvanaMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMilestones = useCallback(async () => {
    if (!userId) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nirvanaService = await getNirvanaService(getToken, userId);
      const data = await nirvanaService.getMilestones();
      setMilestones(data);
      setError(null);
    } catch (err) {
      console.error('Error loading milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const toggleMilestone = useCallback(async (milestoneId: string, completed: boolean) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    await nirvanaService.updateMilestone(milestoneId, completed);
    await loadMilestones();
  }, [getToken, userId, loadMilestones]);

  const addMilestone = useCallback(async (milestone: any) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    const newMilestone = await nirvanaService.addMilestone(milestone);
    setMilestones(prev => [...prev, newMilestone]);
    return newMilestone;
  }, [getToken, userId]);

  return {
    milestones,
    loading,
    error,
    toggleMilestone,
    addMilestone,
    reload: loadMilestones
  };
}

// Hook for managing personal records
export function useNirvanaPersonalRecords() {
  const { getToken, userId } = useAuth();
  const [personalRecords, setPersonalRecords] = useState<NirvanaPersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPersonalRecords = useCallback(async () => {
    if (!userId) {
      setPersonalRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nirvanaService = await getNirvanaService(getToken, userId);
      const data = await nirvanaService.getPersonalRecords();
      setPersonalRecords(data);
      setError(null);
    } catch (err) {
      console.error('Error loading personal records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load personal records');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadPersonalRecords();
  }, [loadPersonalRecords]);

  const updatePersonalRecord = useCallback(async (recordId: string, value: number) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    await nirvanaService.updatePersonalRecord(recordId, value);
    await loadPersonalRecords();
  }, [getToken, userId, loadPersonalRecords]);

  const addPersonalRecord = useCallback(async (record: any) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    const newRecord = await nirvanaService.addPersonalRecord(record);
    setPersonalRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, [getToken, userId]);

  return {
    personalRecords,
    loading,
    error,
    updatePersonalRecord,
    addPersonalRecord,
    reload: loadPersonalRecords
  };
}

// Hook for managing body part mappings
export function useBodyPartMappings() {
  const { getToken, userId } = useAuth();
  const [mappings, setMappings] = useState<BodyPartMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMappings = useCallback(async () => {
    if (!userId) {
      setMappings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const nirvanaService = await getNirvanaService(getToken, userId);
      const data = await nirvanaService.getBodyPartMappings();
      setMappings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading body part mappings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load body part mappings');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const updateMapping = useCallback(async (sessionType: string, bodyParts: any[], intensity: string) => {
    const nirvanaService = await getNirvanaService(getToken, userId);
    const updated = await nirvanaService.updateBodyPartMapping(sessionType, bodyParts, intensity);
    await loadMappings();
    return updated;
  }, [getToken, userId, loadMappings]);

  return {
    mappings,
    loading,
    error,
    updateMapping,
    reload: loadMappings
  };
}
