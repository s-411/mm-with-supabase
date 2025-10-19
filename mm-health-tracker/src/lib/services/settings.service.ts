import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

type Compound = Database['public']['Tables']['compounds']['Row'];
type CompoundInsert = Database['public']['Tables']['compounds']['Insert'];
type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];
type FoodTemplateInsert = Database['public']['Tables']['food_templates']['Insert'];
type NirvanaSessionType = Database['public']['Tables']['nirvana_session_types']['Row'];
type NirvanaSessionTypeInsert = Database['public']['Tables']['nirvana_session_types']['Insert'];

export class SettingsService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  // =============================================
  // COMPOUNDS
  // =============================================

  async getCompounds(): Promise<Compound[]> {
    const { data, error } = await this.supabase
      .from('compounds')
      .select('*')
      .eq('user_id', this.userId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch compounds: ${error.message}`);
    }

    return data || [];
  }

  async addCompound(name: string): Promise<Compound> {
    // Get current max order_index
    const compounds = await this.getCompounds();
    const maxOrder = compounds.length > 0
      ? Math.max(...compounds.map(c => c.order_index))
      : -1;

    const { data, error } = await this.supabase
      .from('compounds')
      .insert({
        user_id: this.userId,
        name,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add compound: ${error.message}`);
    }

    return data;
  }

  async removeCompound(compoundId: string): Promise<void> {
    const { error } = await this.supabase
      .from('compounds')
      .delete()
      .eq('id', compoundId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to remove compound: ${error.message}`);
    }
  }

  async seedDefaultCompounds(): Promise<void> {
    const { error } = await this.supabase.rpc('seed_default_compounds', {
      p_user_id: this.userId,
    });

    if (error) {
      console.error('Failed to seed default compounds:', error);
      // Don't throw - this is optional
    }
  }

  // =============================================
  // FOOD TEMPLATES
  // =============================================

  async getFoodTemplates(): Promise<FoodTemplate[]> {
    const { data, error } = await this.supabase
      .from('food_templates')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch food templates: ${error.message}`);
    }

    return data || [];
  }

  async addFoodTemplate(template: Omit<FoodTemplateInsert, 'user_id' | 'id' | 'created_at'>): Promise<FoodTemplate> {
    const { data, error } = await this.supabase
      .from('food_templates')
      .insert({
        user_id: this.userId,
        ...template,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add food template: ${error.message}`);
    }

    return data;
  }

  async removeFoodTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('food_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to remove food template: ${error.message}`);
    }
  }

  // =============================================
  // NIRVANA SESSION TYPES
  // =============================================

  async getNirvanaSessionTypes(): Promise<NirvanaSessionType[]> {
    const { data, error } = await this.supabase
      .from('nirvana_session_types')
      .select('*')
      .eq('user_id', this.userId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch nirvana session types: ${error.message}`);
    }

    return data || [];
  }

  async addNirvanaSessionType(name: string): Promise<NirvanaSessionType> {
    // Get current max order_index
    const types = await this.getNirvanaSessionTypes();
    const maxOrder = types.length > 0
      ? Math.max(...types.map(t => t.order_index))
      : -1;

    const { data, error } = await this.supabase
      .from('nirvana_session_types')
      .insert({
        user_id: this.userId,
        name,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add nirvana session type: ${error.message}`);
    }

    return data;
  }

  async removeNirvanaSessionType(typeId: string): Promise<void> {
    const { error } = await this.supabase
      .from('nirvana_session_types')
      .delete()
      .eq('id', typeId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to remove nirvana session type: ${error.message}`);
    }
  }

  async seedDefaultSessionTypes(): Promise<void> {
    const { error } = await this.supabase.rpc('seed_default_session_types', {
      p_user_id: this.userId,
    });

    if (error) {
      console.error('Failed to seed default session types:', error);
      // Don't throw - this is optional
    }
  }

  // =============================================
  // MACRO TARGETS (stored in user_profiles.macro_targets JSONB)
  // =============================================

  async getMacroTargets(): Promise<{ calories: string; carbs: string; protein: string; fat: string }> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('macro_targets')
      .eq('id', this.userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch macro targets: ${error.message}`);
    }

    return (data?.macro_targets as any) || { calories: '', carbs: '', protein: '', fat: '' };
  }

  async updateMacroTargets(targets: { calories: string; carbs: string; protein: string; fat: string }): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ macro_targets: targets as any })
      .eq('id', this.userId);

    if (error) {
      throw new Error(`Failed to update macro targets: ${error.message}`);
    }
  }

  // =============================================
  // TRACKER SETTINGS (stored in user_profiles.tracker_settings JSONB)
  // =============================================

  async getTrackerSettings(): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('tracker_settings')
      .eq('id', this.userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch tracker settings: ${error.message}`);
    }

    return data?.tracker_settings || {};
  }

  async updateTrackerSettings(settings: any): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ tracker_settings: settings })
      .eq('id', this.userId);

    if (error) {
      throw new Error(`Failed to update tracker settings: ${error.message}`);
    }
  }
}
