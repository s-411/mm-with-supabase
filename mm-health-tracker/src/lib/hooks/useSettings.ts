import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { SettingsService } from '@/lib/services/settings.service';
import { ProfileService } from '@/lib/services/profile.service';
import { Database } from '@/lib/supabase/database.types';

type Compound = Database['public']['Tables']['compounds']['Row'];
type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];
type NirvanaSessionType = Database['public']['Tables']['nirvana_session_types']['Row'];

async function getSettingsService(getToken: any, userId: string): Promise<SettingsService> {
  if (!userId) throw new Error('Not authenticated');

  const token = await getToken({ template: 'supabase' });
  if (!token) throw new Error('No auth token');

  const supabase = createClerkSupabaseClient(token);
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new SettingsService(supabase, profile.id);
}

export function useCompounds() {
  const { getToken, userId } = useAuth();
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompounds = useCallback(async () => {
    if (!userId) {
      setCompounds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(getToken, userId);
      const data = await settingsService.getCompounds();
      setCompounds(data);
      setError(null);
    } catch (err) {
      console.error('Error loading compounds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load compounds');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadCompounds();
  }, [loadCompounds]);

  const addCompound = useCallback(async (name: string) => {
    const settingsService = await getSettingsService(getToken, userId);
    const newCompound = await settingsService.addCompound(name);
    setCompounds(prev => [...prev, newCompound]);
    return newCompound;
  }, [getToken, userId]);

  const removeCompound = useCallback(async (compoundId: string) => {
    const settingsService = await getSettingsService(getToken, userId);
    await settingsService.removeCompound(compoundId);
    setCompounds(prev => prev.filter(c => c.id !== compoundId));
  }, [getToken, userId]);

  return {
    compounds,
    loading,
    error,
    addCompound,
    removeCompound,
    reload: loadCompounds,
  };
}

export function useFoodTemplates() {
  const { getToken, userId } = useAuth();
  const [templates, setTemplates] = useState<FoodTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    if (!userId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(getToken, userId);
      const data = await settingsService.getFoodTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error('Error loading food templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load food templates');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const addTemplate = useCallback(async (template: { name: string; calories: number; carbs: number; protein: number; fat: number }) => {
    const settingsService = await getSettingsService(getToken, userId);
    const newTemplate = await settingsService.addFoodTemplate(template);
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, [getToken, userId]);

  const removeTemplate = useCallback(async (templateId: string) => {
    const settingsService = await getSettingsService(getToken, userId);
    await settingsService.removeFoodTemplate(templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [getToken, userId]);

  return {
    templates,
    loading,
    error,
    addTemplate,
    removeTemplate,
    reload: loadTemplates,
  };
}

export function useNirvanaSessionTypes() {
  const { getToken, userId } = useAuth();
  const [sessionTypes, setSessionTypes] = useState<NirvanaSessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessionTypes = useCallback(async () => {
    if (!userId) {
      setSessionTypes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(getToken, userId);
      const data = await settingsService.getNirvanaSessionTypes();
      setSessionTypes(data);
      setError(null);
    } catch (err) {
      console.error('Error loading nirvana session types:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session types');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadSessionTypes();
  }, [loadSessionTypes]);

  const addSessionType = useCallback(async (name: string) => {
    const settingsService = await getSettingsService(getToken, userId);
    const newType = await settingsService.addNirvanaSessionType(name);
    setSessionTypes(prev => [...prev, newType]);
    return newType;
  }, [getToken, userId]);

  const removeSessionType = useCallback(async (typeId: string) => {
    const settingsService = await getSettingsService(getToken, userId);
    await settingsService.removeNirvanaSessionType(typeId);
    setSessionTypes(prev => prev.filter(t => t.id !== typeId));
  }, [getToken, userId]);

  return {
    sessionTypes,
    loading,
    error,
    addSessionType,
    removeSessionType,
    reload: loadSessionTypes,
  };
}

export function useMacroTargets() {
  const { getToken, userId } = useAuth();
  const [macroTargets, setMacroTargets] = useState({ calories: '', carbs: '', protein: '', fat: '' });
  const [loading, setLoading] = useState(true);

  const loadMacroTargets = useCallback(async () => {
    if (!userId) {
      setMacroTargets({ calories: '', carbs: '', protein: '', fat: '' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(getToken, userId);
      const data = await settingsService.getMacroTargets();
      setMacroTargets(data);
    } catch (err) {
      console.error('Error loading macro targets:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadMacroTargets();
  }, [loadMacroTargets]);

  const updateMacroTargets = useCallback(async (targets: { calories: string; carbs: string; protein: string; fat: string }) => {
    const settingsService = await getSettingsService(getToken, userId);
    await settingsService.updateMacroTargets(targets);
    setMacroTargets(targets);
  }, [getToken, userId]);

  return {
    macroTargets,
    loading,
    updateMacroTargets,
    reload: loadMacroTargets,
  };
}

export function useTrackerSettings() {
  const { getToken, userId } = useAuth();
  const [trackerSettings, setTrackerSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadTrackerSettings = useCallback(async () => {
    if (!userId) {
      setTrackerSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(getToken, userId);
      const data = await settingsService.getTrackerSettings();
      setTrackerSettings(data);
    } catch (err) {
      console.error('Error loading tracker settings:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadTrackerSettings();
  }, [loadTrackerSettings]);

  const updateTrackerSettings = useCallback(async (settings: any) => {
    const settingsService = await getSettingsService(getToken, userId);
    await settingsService.updateTrackerSettings(settings);
    setTrackerSettings(settings);
  }, [getToken, userId]);

  return {
    trackerSettings,
    loading,
    updateTrackerSettings,
    reload: loadTrackerSettings,
  };
}
