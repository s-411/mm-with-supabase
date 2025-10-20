import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { SettingsService } from '@/lib/services/settings.service';
import { ProfileService } from '@/lib/services/profile.service';
import { queryKeys } from '@/lib/query-keys';
import { Database } from '@/lib/supabase/database.types';

type Compound = Database['public']['Tables']['compounds']['Row'];
type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];
type NirvanaSessionType = Database['public']['Tables']['nirvana_session_types']['Row'];

/**
 * Helper to get SettingsService instance
 */
async function getSettingsService(userId: string): Promise<SettingsService> {
  if (!userId) throw new Error('Not authenticated');

  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new SettingsService(supabase, profile.id);
}

// ============================================
// COMPOUNDS - Injectable compounds management
// ============================================

export function useCompounds() {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.settings.compounds(),
    queryFn: async (): Promise<Compound[]> => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.getCompounds();
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 10, // 10 minutes - compounds don't change often
  });

  return {
    compounds: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export function useAddCompound() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.addCompound(name);
    },

    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.compounds() });
      const previous = queryClient.getQueryData<Compound[]>(queryKeys.settings.compounds());

      queryClient.setQueryData<Compound[]>(queryKeys.settings.compounds(), (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          profile_id: user?.id ?? '',
          name,
          created_at: new Date().toISOString(),
        } as Compound,
      ]);

      return { previous };
    },

    onError: (err, name, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.compounds(), context.previous);
      }
      console.error('Failed to add compound:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.compounds() });
    },
  });
}

export function useRemoveCompound() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (compoundId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      await settingsService.removeCompound(compoundId);
    },

    onMutate: async (compoundId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.compounds() });
      const previous = queryClient.getQueryData<Compound[]>(queryKeys.settings.compounds());

      queryClient.setQueryData<Compound[]>(queryKeys.settings.compounds(), (old) =>
        (old ?? []).filter((c) => c.id !== compoundId)
      );

      return { previous };
    },

    onError: (err, compoundId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.compounds(), context.previous);
      }
      console.error('Failed to remove compound:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.compounds() });
    },
  });
}

// ============================================
// FOOD TEMPLATES - Quick calorie entry templates
// ============================================

export function useFoodTemplates() {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.settings.foodTemplates(),
    queryFn: async (): Promise<FoodTemplate[]> => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.getFoodTemplates();
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    templates: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export function useAddFoodTemplate() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      calories: number;
      carbs: number;
      protein: number;
      fat: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.addFoodTemplate(template);
    },

    onMutate: async (template) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.foodTemplates() });
      const previous = queryClient.getQueryData<FoodTemplate[]>(
        queryKeys.settings.foodTemplates()
      );

      queryClient.setQueryData<FoodTemplate[]>(queryKeys.settings.foodTemplates(), (old) => [
        {
          ...template,
          id: `temp-${Date.now()}`,
          profile_id: user?.id ?? '',
          created_at: new Date().toISOString(),
        } as FoodTemplate,
        ...(old ?? []),
      ]);

      return { previous };
    },

    onError: (err, template, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.foodTemplates(), context.previous);
      }
      console.error('Failed to add food template:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.foodTemplates() });
    },
  });
}

export function useRemoveFoodTemplate() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      await settingsService.removeFoodTemplate(templateId);
    },

    onMutate: async (templateId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.foodTemplates() });
      const previous = queryClient.getQueryData<FoodTemplate[]>(
        queryKeys.settings.foodTemplates()
      );

      queryClient.setQueryData<FoodTemplate[]>(
        queryKeys.settings.foodTemplates(),
        (old) => (old ?? []).filter((t) => t.id !== templateId)
      );

      return { previous };
    },

    onError: (err, templateId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.foodTemplates(), context.previous);
      }
      console.error('Failed to remove food template:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.foodTemplates() });
    },
  });
}

// ============================================
// NIRVANA SESSION TYPES - Training categories
// ============================================

const DEFAULT_SESSION_TYPES = [
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
  'Yin yoga',
];

export function useNirvanaSessionTypes() {
  const { user } = useApp();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.settings.sessionTypes(),
    queryFn: async (): Promise<NirvanaSessionType[]> => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      const data = await settingsService.getNirvanaSessionTypes();

      // If no session types exist, seed the defaults
      if (data.length === 0) {
        const seededTypes = [];
        for (const name of DEFAULT_SESSION_TYPES) {
          const newType = await settingsService.addNirvanaSessionType(name);
          seededTypes.push(newType);
        }
        return seededTypes;
      }

      return data;
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    sessionTypes: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export function useAddNirvanaSessionType() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.addNirvanaSessionType(name);
    },

    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.sessionTypes() });
      const previous = queryClient.getQueryData<NirvanaSessionType[]>(
        queryKeys.settings.sessionTypes()
      );

      queryClient.setQueryData<NirvanaSessionType[]>(
        queryKeys.settings.sessionTypes(),
        (old) => [
          ...(old ?? []),
          {
            id: `temp-${Date.now()}`,
            profile_id: user?.id ?? '',
            name,
            created_at: new Date().toISOString(),
          } as NirvanaSessionType,
        ]
      );

      return { previous };
    },

    onError: (err, name, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.sessionTypes(), context.previous);
      }
      console.error('Failed to add session type:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessionTypes() });
    },
  });
}

export function useRemoveNirvanaSessionType() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (typeId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      await settingsService.removeNirvanaSessionType(typeId);
    },

    onMutate: async (typeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.sessionTypes() });
      const previous = queryClient.getQueryData<NirvanaSessionType[]>(
        queryKeys.settings.sessionTypes()
      );

      queryClient.setQueryData<NirvanaSessionType[]>(
        queryKeys.settings.sessionTypes(),
        (old) => (old ?? []).filter((t) => t.id !== typeId)
      );

      return { previous };
    },

    onError: (err, typeId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.sessionTypes(), context.previous);
      }
      console.error('Failed to remove session type:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.sessionTypes() });
    },
  });
}

// ============================================
// MACRO TARGETS - Daily nutrition goals
// ============================================

interface MacroTargets {
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
}

export function useMacroTargets() {
  const { user } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.settings.macroTargets(),
    queryFn: async (): Promise<MacroTargets> => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.getMacroTargets();
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    macroTargets: data ?? { calories: '', carbs: '', protein: '', fat: '' },
    loading: isLoading,
  };
}

export function useUpdateMacroTargets() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (targets: MacroTargets) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      await settingsService.updateMacroTargets(targets);
      return targets;
    },

    onMutate: async (targets) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.macroTargets() });
      const previous = queryClient.getQueryData<MacroTargets>(
        queryKeys.settings.macroTargets()
      );

      queryClient.setQueryData<MacroTargets>(queryKeys.settings.macroTargets(), targets);

      return { previous };
    },

    onError: (err, targets, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.macroTargets(), context.previous);
      }
      console.error('Failed to update macro targets:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.macroTargets() });
    },
  });
}

// ============================================
// TRACKER SETTINGS - General app settings
// ============================================

export function useTrackerSettings() {
  const { user } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.settings.trackerSettings(),
    queryFn: async (): Promise<any> => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      return settingsService.getTrackerSettings();
    },
    enabled: !!user?.id && typeof window !== 'undefined', // Only run on client
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    trackerSettings: data ?? null,
    loading: isLoading,
  };
}

export function useUpdateTrackerSettings() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (settings: any) => {
      if (!user?.id) throw new Error('Not authenticated');
      const settingsService = await getSettingsService(user.id);
      await settingsService.updateTrackerSettings(settings);
      return settings;
    },

    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.trackerSettings() });
      const previous = queryClient.getQueryData(queryKeys.settings.trackerSettings());

      queryClient.setQueryData(queryKeys.settings.trackerSettings(), settings);

      return { previous };
    },

    onError: (err, settings, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings.trackerSettings(), context.previous);
      }
      console.error('Failed to update tracker settings:', err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.trackerSettings() });
    },
  });
}
