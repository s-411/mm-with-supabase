import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

interface ExportData {
  version: string;
  exportDate: string;
  userId: string;
  profile: any;
  dailyEntries: any[];
  calorieEntries: any[];
  exerciseEntries: any[];
  injectionEntries: any[];
  mits: any[];
  weeklyEntries: any[];
  nirvanaEntries: any[];
  nirvanaSessions: any[];
  nirvanaMilestones: any[];
  nirvanaPersonalRecords: any[];
  bodyPartMappings: any[];
  compounds: any[];
  foodTemplates: any[];
  nirvanaSessionTypes: any[];
  winnersBibleImages: any[];
}

interface ImportStats {
  dailyEntries: number;
  calorieEntries: number;
  exerciseEntries: number;
  injectionEntries: number;
  mits: number;
  weeklyEntries: number;
  nirvanaEntries: number;
  nirvanaSessions: number;
  nirvanaMilestones: number;
  nirvanaPersonalRecords: number;
  bodyPartMappings: number;
  compounds: number;
  foodTemplates: number;
  nirvanaSessionTypes: number;
  winnersBibleImages: number;
}

export class ExportService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  /**
   * Export all user data to JSON
   */
  async exportAllData(): Promise<string> {
    try {
      // Fetch user profile
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      // Fetch all daily entries
      const { data: dailyEntries } = await this.supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all calorie entries
      const { data: calorieEntries } = await this.supabase
        .from('calorie_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all exercise entries
      const { data: exerciseEntries } = await this.supabase
        .from('exercise_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all injection entries
      const { data: injectionEntries } = await this.supabase
        .from('injection_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all MITs
      const { data: mits } = await this.supabase
        .from('mits')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all weekly entries
      const { data: weeklyEntries } = await this.supabase
        .from('weekly_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('week_start', { ascending: true });

      // Fetch all nirvana entries
      const { data: nirvanaEntries } = await this.supabase
        .from('nirvana_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      // Fetch all nirvana sessions
      const { data: nirvanaSessions } = await this.supabase
        .from('nirvana_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: true });

      // Fetch all nirvana milestones
      const { data: nirvanaMilestones } = await this.supabase
        .from('nirvana_milestones')
        .select('*')
        .eq('user_id', this.userId)
        .order('order_index', { ascending: true });

      // Fetch all nirvana personal records
      const { data: nirvanaPersonalRecords } = await this.supabase
        .from('nirvana_personal_records')
        .select('*')
        .eq('user_id', this.userId)
        .order('name', { ascending: true });

      // Fetch all body part mappings
      const { data: bodyPartMappings } = await this.supabase
        .from('body_part_mappings')
        .select('*')
        .eq('user_id', this.userId);

      // Fetch all compounds
      const { data: compounds } = await this.supabase
        .from('compounds')
        .select('*')
        .eq('user_id', this.userId)
        .order('order_index', { ascending: true });

      // Fetch all food templates
      const { data: foodTemplates } = await this.supabase
        .from('food_templates')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: true });

      // Fetch all nirvana session types
      const { data: nirvanaSessionTypes } = await this.supabase
        .from('nirvana_session_types')
        .select('*')
        .eq('user_id', this.userId)
        .order('order_index', { ascending: true });

      // Fetch winners bible images metadata (not the actual images)
      const { data: winnersBibleImages } = await this.supabase
        .from('winners_bible_images')
        .select('*')
        .eq('user_id', this.userId)
        .order('display_order', { ascending: true });

      const exportData: ExportData = {
        version: '2.0.0', // Version 2.0 indicates Supabase format
        exportDate: new Date().toISOString(),
        userId: this.userId,
        profile: profile || null,
        dailyEntries: dailyEntries || [],
        calorieEntries: calorieEntries || [],
        exerciseEntries: exerciseEntries || [],
        injectionEntries: injectionEntries || [],
        mits: mits || [],
        weeklyEntries: weeklyEntries || [],
        nirvanaEntries: nirvanaEntries || [],
        nirvanaSessions: nirvanaSessions || [],
        nirvanaMilestones: nirvanaMilestones || [],
        nirvanaPersonalRecords: nirvanaPersonalRecords || [],
        bodyPartMappings: bodyPartMappings || [],
        compounds: compounds || [],
        foodTemplates: foodTemplates || [],
        nirvanaSessionTypes: nirvanaSessionTypes || [],
        winnersBibleImages: winnersBibleImages || [],
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import data from JSON backup
   * This will merge data, not overwrite existing data
   */
  async importData(jsonString: string): Promise<ImportStats> {
    try {
      const importData: ExportData = JSON.parse(jsonString);

      // Validate version
      if (!importData.version || !importData.version.startsWith('2.')) {
        throw new Error('Invalid import format. Please use data exported from the Supabase version of the app.');
      }

      const stats: ImportStats = {
        dailyEntries: 0,
        calorieEntries: 0,
        exerciseEntries: 0,
        injectionEntries: 0,
        mits: 0,
        weeklyEntries: 0,
        nirvanaEntries: 0,
        nirvanaSessions: 0,
        nirvanaMilestones: 0,
        nirvanaPersonalRecords: 0,
        bodyPartMappings: 0,
        compounds: 0,
        foodTemplates: 0,
        nirvanaSessionTypes: 0,
        winnersBibleImages: 0,
      };

      // Import profile data (update existing)
      if (importData.profile) {
        const { macro_targets, tracker_settings, bmr } = importData.profile;
        const updateData: any = {};
        if (macro_targets) updateData.macro_targets = macro_targets;
        if (tracker_settings) updateData.tracker_settings = tracker_settings;
        if (bmr !== undefined && bmr !== null) updateData.bmr = bmr;

        if (Object.keys(updateData).length > 0) {
          await this.supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', this.userId);
        }
      }

      // Import daily entries (upsert)
      if (importData.dailyEntries?.length > 0) {
        for (const entry of importData.dailyEntries) {
          const { id, created_at, updated_at, ...entryData } = entry;
          await this.supabase
            .from('daily_entries')
            .upsert({ ...entryData, user_id: this.userId });
          stats.dailyEntries++;
        }
      }

      // Import calorie entries (insert if not exists by checking date + description + calories)
      if (importData.calorieEntries?.length > 0) {
        for (const entry of importData.calorieEntries) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('calorie_entries')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.calorieEntries++;
        }
      }

      // Import exercise entries
      if (importData.exerciseEntries?.length > 0) {
        for (const entry of importData.exerciseEntries) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('exercise_entries')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.exerciseEntries++;
        }
      }

      // Import injection entries
      if (importData.injectionEntries?.length > 0) {
        for (const entry of importData.injectionEntries) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('injection_entries')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.injectionEntries++;
        }
      }

      // Import MITs
      if (importData.mits?.length > 0) {
        for (const entry of importData.mits) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('mits')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.mits++;
        }
      }

      // Import weekly entries (upsert by week_start)
      if (importData.weeklyEntries?.length > 0) {
        for (const entry of importData.weeklyEntries) {
          const { id, created_at, updated_at, ...entryData } = entry;
          await this.supabase
            .from('weekly_entries')
            .upsert({ ...entryData, user_id: this.userId });
          stats.weeklyEntries++;
        }
      }

      // Import nirvana entries (upsert by date)
      if (importData.nirvanaEntries?.length > 0) {
        for (const entry of importData.nirvanaEntries) {
          const { id, created_at, ...entryData } = entry;
          await this.supabase
            .from('nirvana_entries')
            .upsert({ ...entryData, user_id: this.userId });
          stats.nirvanaEntries++;
        }
      }

      // Import nirvana sessions
      if (importData.nirvanaSessions?.length > 0) {
        for (const entry of importData.nirvanaSessions) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('nirvana_sessions')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.nirvanaSessions++;
        }
      }

      // Import nirvana milestones
      if (importData.nirvanaMilestones?.length > 0) {
        for (const entry of importData.nirvanaMilestones) {
          const { id, created_at, updated_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('nirvana_milestones')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.nirvanaMilestones++;
        }
      }

      // Import nirvana personal records
      if (importData.nirvanaPersonalRecords?.length > 0) {
        for (const entry of importData.nirvanaPersonalRecords) {
          const { id, created_at, updated_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('nirvana_personal_records')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.nirvanaPersonalRecords++;
        }
      }

      // Import body part mappings (upsert by session_type)
      if (importData.bodyPartMappings?.length > 0) {
        for (const entry of importData.bodyPartMappings) {
          const { id, created_at, updated_at, ...entryData } = entry;
          await this.supabase
            .from('body_part_mappings')
            .upsert({ ...entryData, user_id: this.userId });
          stats.bodyPartMappings++;
        }
      }

      // Import compounds
      if (importData.compounds?.length > 0) {
        for (const entry of importData.compounds) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('compounds')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.compounds++;
        }
      }

      // Import food templates
      if (importData.foodTemplates?.length > 0) {
        for (const entry of importData.foodTemplates) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('food_templates')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.foodTemplates++;
        }
      }

      // Import nirvana session types
      if (importData.nirvanaSessionTypes?.length > 0) {
        for (const entry of importData.nirvanaSessionTypes) {
          const { id, created_at, ...entryData } = entry;
          const { error } = await this.supabase
            .from('nirvana_session_types')
            .insert({ ...entryData, user_id: this.userId });
          if (!error) stats.nirvanaSessionTypes++;
        }
      }

      // Note: Winners Bible images are not imported as they require file upload
      // This would require separate handling with actual image files

      return stats;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format');
      }
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all user data (dangerous operation!)
   */
  async clearAllData(): Promise<void> {
    try {
      // Delete in order to respect foreign key constraints
      await this.supabase.from('nirvana_sessions').delete().eq('user_id', this.userId);
      await this.supabase.from('nirvana_entries').delete().eq('user_id', this.userId);
      await this.supabase.from('nirvana_milestones').delete().eq('user_id', this.userId);
      await this.supabase.from('nirvana_personal_records').delete().eq('user_id', this.userId);
      await this.supabase.from('body_part_mappings').delete().eq('user_id', this.userId);
      await this.supabase.from('nirvana_session_types').delete().eq('user_id', this.userId);

      await this.supabase.from('calorie_entries').delete().eq('user_id', this.userId);
      await this.supabase.from('exercise_entries').delete().eq('user_id', this.userId);
      await this.supabase.from('injection_entries').delete().eq('user_id', this.userId);
      await this.supabase.from('mits').delete().eq('user_id', this.userId);
      await this.supabase.from('daily_entries').delete().eq('user_id', this.userId);

      await this.supabase.from('weekly_entries').delete().eq('user_id', this.userId);
      await this.supabase.from('winners_bible_images').delete().eq('user_id', this.userId);
      await this.supabase.from('compounds').delete().eq('user_id', this.userId);
      await this.supabase.from('food_templates').delete().eq('user_id', this.userId);

      // Reset profile settings but don't delete the profile
      await this.supabase
        .from('user_profiles')
        .update({
          macro_targets: {},
          tracker_settings: {}
        } as any)
        .eq('id', this.userId);

    } catch (error) {
      throw new Error(`Clear data failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export data to CSV format (for daily entries)
   */
  async exportToCSV(): Promise<string> {
    try {
      const { data: dailyEntries } = await this.supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', this.userId)
        .order('date', { ascending: true });

      if (!dailyEntries || dailyEntries.length === 0) {
        return 'No data to export';
      }

      // CSV Headers
      const headers = [
        'Date',
        'Weight',
        'Deep Work Completed',
        'Winners Bible Morning',
        'Winners Bible Night',
      ];

      const rows = dailyEntries.map(entry => [
        entry.date,
        entry.weight || '',
        entry.deep_work_completed ? 'Yes' : 'No',
        entry.winners_bible_morning ? 'Yes' : 'No',
        entry.winners_bible_night ? 'Yes' : 'No',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
