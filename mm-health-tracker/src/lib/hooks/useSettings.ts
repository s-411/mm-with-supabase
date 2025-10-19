import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { SettingsService } from '@/lib/services/settings.service';
import { Database } from '@/lib/supabase/database.types';

type Compound = Database['public']['Tables']['compounds']['Row'];
type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];
type NirvanaSessionType = Database['public']['Tables']['nirvana_session_types']['Row'];

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
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      const supabase = createClerkSupabaseClient(token);
      const settingsService = new SettingsService(supabase, userId);

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
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

    const newCompound = await settingsService.addCompound(name);
    setCompounds(prev => [...prev, newCompound]);
    return newCompound;
  }, [getToken, userId]);

  const removeCompound = useCallback(async (compoundId: string) => {
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

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
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      const supabase = createClerkSupabaseClient(token);
      const settingsService = new SettingsService(supabase, userId);

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
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

    const newTemplate = await settingsService.addFoodTemplate(template);
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, [getToken, userId]);

  const removeTemplate = useCallback(async (templateId: string) => {
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

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
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      const supabase = createClerkSupabaseClient(token);
      const settingsService = new SettingsService(supabase, userId);

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
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

    const newType = await settingsService.addNirvanaSessionType(name);
    setSessionTypes(prev => [...prev, newType]);
    return newType;
  }, [getToken, userId]);

  const removeSessionType = useCallback(async (typeId: string) => {
    if (!userId) throw new Error('Not authenticated');

    const token = await getToken({ template: 'supabase' });
    if (!token) throw new Error('No auth token');

    const supabase = createClerkSupabaseClient(token);
    const settingsService = new SettingsService(supabase, userId);

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
