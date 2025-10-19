import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

type NirvanaEntry = Database['public']['Tables']['nirvana_entries']['Row'];
type NirvanaEntryInsert = Database['public']['Tables']['nirvana_entries']['Insert'];
type NirvanaSession = Database['public']['Tables']['nirvana_sessions']['Row'];
type NirvanaSessionInsert = Database['public']['Tables']['nirvana_sessions']['Insert'];
type NirvanaMilestone = Database['public']['Tables']['nirvana_milestones']['Row'];
type NirvanaMilestoneInsert = Database['public']['Tables']['nirvana_milestones']['Insert'];
type NirvanaPersonalRecord = Database['public']['Tables']['nirvana_personal_records']['Row'];
type NirvanaPersonalRecordInsert = Database['public']['Tables']['nirvana_personal_records']['Insert'];
type BodyPartMapping = Database['public']['Tables']['body_part_mappings']['Row'];
type BodyPartMappingInsert = Database['public']['Tables']['body_part_mappings']['Insert'];

export class NirvanaService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  // =============================================
  // NIRVANA ENTRIES & SESSIONS
  // =============================================

  async getByDate(date: string): Promise<{
    entry: NirvanaEntry | null;
    sessions: NirvanaSession[];
  }> {
    // Get or create entry for the date
    const { data: entry, error: entryError } = await this.supabase
      .from('nirvana_entries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .maybeSingle();

    if (entryError) {
      throw new Error(`Failed to fetch nirvana entry: ${entryError.message}`);
    }

    // If no entry exists, create one
    let nirvanaEntry = entry;
    if (!entry) {
      const { data: newEntry, error: createError } = await this.supabase
        .from('nirvana_entries')
        .insert({
          user_id: this.userId,
          date,
          total_sessions: 0
        })
        .select()
        .single();

      // Handle race condition - entry might have been created between our check and insert
      if (createError) {
        if (createError.code === '23505') { // Unique violation
          // Try to fetch again
          const { data: existingEntry } = await this.supabase
            .from('nirvana_entries')
            .select('*')
            .eq('user_id', this.userId)
            .eq('date', date)
            .single();
          nirvanaEntry = existingEntry;
        } else {
          throw new Error(`Failed to create nirvana entry: ${createError.message}`);
        }
      } else {
        nirvanaEntry = newEntry;
      }
    }

    // Get sessions for this entry (only if we have an entry)
    if (!nirvanaEntry) {
      return { entry: null, sessions: [] };
    }

    const { data: sessions, error: sessionsError } = await this.supabase
      .from('nirvana_sessions')
      .select('*')
      .eq('nirvana_entry_id', nirvanaEntry.id)
      .order('created_at', { ascending: true });

    if (sessionsError) {
      throw new Error(`Failed to fetch nirvana sessions: ${sessionsError.message}`);
    }

    return {
      entry: nirvanaEntry,
      sessions: sessions || []
    };
  }

  async getWeeklyData(weekStart: string): Promise<{ [date: string]: { entry: NirvanaEntry | null; sessions: NirvanaSession[] } }> {
    const weekData: { [date: string]: { entry: NirvanaEntry | null; sessions: NirvanaSession[] } } = {};

    // Calculate week end date
    const start = new Date(weekStart + 'T12:00:00');

    // Process sequentially to avoid race conditions with entry creation
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const data = await this.getByDate(dateString);
      weekData[dateString] = data;
    }

    return weekData;
  }

  async addSession(date: string, sessionType: string): Promise<NirvanaSession> {
    // Get or create entry
    const { entry } = await this.getByDate(date);

    if (!entry) {
      throw new Error('Failed to get or create nirvana entry');
    }

    // Count existing sessions of this type
    const { data: existingSessions } = await this.supabase
      .from('nirvana_sessions')
      .select('session_number')
      .eq('nirvana_entry_id', entry.id)
      .eq('session_type', sessionType)
      .order('session_number', { ascending: false })
      .limit(1);

    const sessionNumber = existingSessions && existingSessions.length > 0
      ? (existingSessions[0].session_number || 0) + 1
      : 1;

    // Add new session
    const { data: session, error } = await this.supabase
      .from('nirvana_sessions')
      .insert({
        user_id: this.userId,
        nirvana_entry_id: entry.id,
        session_type: sessionType,
        session_number: sessionNumber
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add session: ${error.message}`);
    }

    // Update total count
    const { data: allSessions } = await this.supabase
      .from('nirvana_sessions')
      .select('id')
      .eq('nirvana_entry_id', entry.id);

    await this.supabase
      .from('nirvana_entries')
      .update({ total_sessions: allSessions?.length || 0 })
      .eq('id', entry.id);

    return session;
  }

  async removeSession(sessionId: string): Promise<void> {
    // Get the session first to get entry_id
    const { data: session } = await this.supabase
      .from('nirvana_sessions')
      .select('nirvana_entry_id')
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // Delete the session
    const { error } = await this.supabase
      .from('nirvana_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to remove session: ${error.message}`);
    }

    // Update total count
    const { data: remainingSessions } = await this.supabase
      .from('nirvana_sessions')
      .select('id')
      .eq('nirvana_entry_id', session.nirvana_entry_id);

    await this.supabase
      .from('nirvana_entries')
      .update({ total_sessions: remainingSessions?.length || 0 })
      .eq('id', session.nirvana_entry_id);
  }

  // =============================================
  // MILESTONES
  // =============================================

  async getMilestones(): Promise<NirvanaMilestone[]> {
    const { data, error } = await this.supabase
      .from('nirvana_milestones')
      .select('*')
      .eq('user_id', this.userId)
      .order('category')
      .order('order_index');

    if (error) {
      throw new Error(`Failed to fetch milestones: ${error.message}`);
    }

    return data || [];
  }

  async updateMilestone(milestoneId: string, completed: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('nirvana_milestones')
      .update({
        completed,
        completed_date: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to update milestone: ${error.message}`);
    }
  }

  async addMilestone(milestone: Omit<NirvanaMilestoneInsert, 'user_id'>): Promise<NirvanaMilestone> {
    const { data, error } = await this.supabase
      .from('nirvana_milestones')
      .insert({
        ...milestone,
        user_id: this.userId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add milestone: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // PERSONAL RECORDS
  // =============================================

  async getPersonalRecords(): Promise<NirvanaPersonalRecord[]> {
    const { data, error } = await this.supabase
      .from('nirvana_personal_records')
      .select('*')
      .eq('user_id', this.userId)
      .order('category')
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch personal records: ${error.message}`);
    }

    return data || [];
  }

  async updatePersonalRecord(recordId: string, value: number): Promise<void> {
    // Get current record
    const { data: current } = await this.supabase
      .from('nirvana_personal_records')
      .select('value, record_date')
      .eq('id', recordId)
      .eq('user_id', this.userId)
      .single();

    // Update with new value, storing previous
    const { error } = await this.supabase
      .from('nirvana_personal_records')
      .update({
        value,
        record_date: new Date().toISOString(),
        previous_value: current?.value || null,
        previous_date: current?.record_date || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to update personal record: ${error.message}`);
    }
  }

  async addPersonalRecord(record: Omit<NirvanaPersonalRecordInsert, 'user_id'>): Promise<NirvanaPersonalRecord> {
    const { data, error } = await this.supabase
      .from('nirvana_personal_records')
      .insert({
        ...record,
        user_id: this.userId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add personal record: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // BODY PART MAPPINGS
  // =============================================

  async getBodyPartMappings(): Promise<BodyPartMapping[]> {
    const { data, error } = await this.supabase
      .from('body_part_mappings')
      .select('*')
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to fetch body part mappings: ${error.message}`);
    }

    return data || [];
  }

  async updateBodyPartMapping(sessionType: string, bodyParts: any[], intensity: string): Promise<BodyPartMapping> {
    const { data, error } = await this.supabase
      .from('body_part_mappings')
      .upsert({
        user_id: this.userId,
        session_type: sessionType,
        body_parts: bodyParts,
        intensity,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update body part mapping: ${error.message}`);
    }

    return data;
  }
}
