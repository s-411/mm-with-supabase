import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { SettingsService } from '@/lib/services/settings.service';
import { ProfileService } from '@/lib/services/profile.service';
import { Database } from '@/lib/supabase/database.types';

type Compound = Database['public']['Tables']['compounds']['Row'];
type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];
type NirvanaSessionType = Database['public']['Tables']['nirvana_session_types']['Row'];

async function getSettingsService(userId: string): Promise<SettingsService> {
  if (!userId) throw new Error('Not authenticated');

  // Just use the standard supabase client - no token needed
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new SettingsService(supabase, profile.id);
}

export function useCompounds() {
  const { user } = useApp();
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompounds = useCallback(async () => {
    if (!user?.id) {
      setCompounds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getCompounds();
      setCompounds(data);
      setError(null);
    } catch (err) {
      console.error('Error loading compounds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load compounds');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCompounds();
  }, [loadCompounds]);

  const addCompound = useCallback(async (name: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    const newCompound = await settingsService.addCompound(name);
    setCompounds(prev => [...prev, newCompound]);
    return newCompound;
  }, [user?.id]);

  const removeCompound = useCallback(async (compoundId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    await settingsService.removeCompound(compoundId);
    setCompounds(prev => prev.filter(c => c.id !== compoundId));
  }, [user?.id]);

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
  const { user } = useApp();
  const [templates, setTemplates] = useState<FoodTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    if (!user?.id) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getFoodTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      console.error('Error loading food templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load food templates');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const addTemplate = useCallback(async (template: { name: string; calories: number; carbs: number; protein: number; fat: number }) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    const newTemplate = await settingsService.addFoodTemplate(template);
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, [user?.id]);

  const removeTemplate = useCallback(async (templateId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    await settingsService.removeFoodTemplate(templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [user?.id]);

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
  const { user } = useApp();
  const [sessionTypes, setSessionTypes] = useState<NirvanaSessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessionTypes = useCallback(async () => {
    if (!user?.id) {
      setSessionTypes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getNirvanaSessionTypes();

      // If no session types exist, seed the defaults
      if (data.length === 0) {
        const defaultSessionTypes = [
          'Mobility: Shoulder, elbow, and wrist',
          'Mobility: Spine',
          'Mobility: hip, knee, and ankle',
          'Beginner handstands',
          'Handstands',
          'Press handstand',
          'Handstand push-up',
          'Abs and glutes',
          'Power yoga',
          'Pilates',
          'Back bends',
          'Single leg squat',
          'Side splits',
          'Front splits',
          'Yin yoga'
        ];

        // Add all default session types
        const seededTypes = [];
        for (let i = 0; i < defaultSessionTypes.length; i++) {
          const newType = await settingsService.addNirvanaSessionType(defaultSessionTypes[i]);
          seededTypes.push(newType);
        }
        setSessionTypes(seededTypes);
      } else {
        setSessionTypes(data);
      }

      setError(null);
    } catch (err) {
      console.error('Error loading nirvana session types:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session types');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSessionTypes();
  }, [loadSessionTypes]);

  const addSessionType = useCallback(async (name: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    const newType = await settingsService.addNirvanaSessionType(name);
    setSessionTypes(prev => [...prev, newType]);
    return newType;
  }, [user?.id]);

  const removeSessionType = useCallback(async (typeId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    await settingsService.removeNirvanaSessionType(typeId);
    setSessionTypes(prev => prev.filter(t => t.id !== typeId));
  }, [user?.id]);

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
  const { user } = useApp();
  const [macroTargets, setMacroTargets] = useState({ calories: '', carbs: '', protein: '', fat: '' });
  const [loading, setLoading] = useState(true);

  const loadMacroTargets = useCallback(async () => {
    if (!user?.id) {
      setMacroTargets({ calories: '', carbs: '', protein: '', fat: '' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getMacroTargets();
      setMacroTargets(data);
    } catch (err) {
      console.error('Error loading macro targets:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMacroTargets();
  }, [loadMacroTargets]);

  const updateMacroTargets = useCallback(async (targets: { calories: string; carbs: string; protein: string; fat: string }) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    await settingsService.updateMacroTargets(targets);
    setMacroTargets(targets);
  }, [user?.id]);

  return {
    macroTargets,
    loading,
    updateMacroTargets,
    reload: loadMacroTargets,
  };
}

export function useTrackerSettings() {
  const { user } = useApp();
  const [trackerSettings, setTrackerSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadTrackerSettings = useCallback(async () => {
    if (!user?.id) {
      setTrackerSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getTrackerSettings();
      setTrackerSettings(data);
    } catch (err) {
      console.error('Error loading tracker settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTrackerSettings();
  }, [loadTrackerSettings]);

  const updateTrackerSettings = useCallback(async (settings: any) => {
    if (!user?.id) throw new Error('Not authenticated');
    const settingsService = await getSettingsService(user.id);
    await settingsService.updateTrackerSettings(settings);
    setTrackerSettings(settings);
  }, [user?.id]);

  return {
    trackerSettings,
    loading,
    updateTrackerSettings,
    reload: loadTrackerSettings,
  };
}
