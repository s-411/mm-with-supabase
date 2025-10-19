export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      calorie_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          daily_entry_id: string | null
          date: string
          fat: number | null
          fiber: number | null
          food_name: string
          id: string
          meal_type: string | null
          protein: number | null
          quantity: number | null
          sodium: number | null
          sugar: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          daily_entry_id?: string | null
          date: string
          fat?: number | null
          fiber?: number | null
          food_name: string
          id?: string
          meal_type?: string | null
          protein?: number | null
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          daily_entry_id?: string | null
          date?: string
          fat?: number | null
          fiber?: number | null
          food_name?: string
          id?: string
          meal_type?: string | null
          protein?: number | null
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calorie_entries_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_metrics: {
        Row: {
          category: string | null
          created_at: string
          date: string
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date: string
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_entries: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          bone_mass: number | null
          created_at: string
          date: string
          energy_level: number | null
          id: string
          metabolic_age: number | null
          mood: number | null
          muscle_mass: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          updated_at: string
          user_id: string
          visceral_fat: number | null
          water_percentage: number | null
          weight: number | null
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date: string
          energy_level?: number | null
          id?: string
          metabolic_age?: number | null
          mood?: number | null
          muscle_mass?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id: string
          visceral_fat?: number | null
          water_percentage?: number | null
          weight?: number | null
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          bone_mass?: number | null
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          metabolic_age?: number | null
          mood?: number | null
          muscle_mass?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          updated_at?: string
          user_id?: string
          visceral_fat?: number | null
          water_percentage?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      exercise_entries: {
        Row: {
          calories_burned: number | null
          created_at: string
          daily_entry_id: string | null
          date: string
          distance: number | null
          duration_minutes: number | null
          exercise_type: string
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          user_id: string
          weight_lifted: number | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          daily_entry_id?: string | null
          date: string
          distance?: number | null
          duration_minutes?: number | null
          exercise_type: string
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id: string
          weight_lifted?: number | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          daily_entry_id?: string | null
          date?: string
          distance?: number | null
          duration_minutes?: number | null
          exercise_type?: string
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          user_id?: string
          weight_lifted?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_entries_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      injection_entries: {
        Row: {
          compound_name: string
          created_at: string
          date: string
          dosage_amount: number | null
          dosage_unit: string
          id: string
          injection_site: string | null
          notes: string | null
          time_of_day: string | null
          user_id: string
        }
        Insert: {
          compound_name: string
          created_at?: string
          date: string
          dosage_amount?: number | null
          dosage_unit: string
          id?: string
          injection_site?: string | null
          notes?: string | null
          time_of_day?: string | null
          user_id: string
        }
        Update: {
          compound_name?: string
          created_at?: string
          date?: string
          dosage_amount?: number | null
          dosage_unit?: string
          id?: string
          injection_site?: string | null
          notes?: string | null
          time_of_day?: string | null
          user_id?: string
        }
        Relationships: []
      }
      injection_targets: {
        Row: {
          active: boolean | null
          compound_name: string
          created_at: string
          end_date: string | null
          frequency: string | null
          id: string
          start_date: string | null
          unit: string
          user_id: string
          weekly_target: number | null
        }
        Insert: {
          active?: boolean | null
          compound_name: string
          created_at?: string
          end_date?: string | null
          frequency?: string | null
          id?: string
          start_date?: string | null
          unit: string
          user_id: string
          weekly_target?: number | null
        }
        Update: {
          active?: boolean | null
          compound_name?: string
          created_at?: string
          end_date?: string | null
          frequency?: string | null
          id?: string
          start_date?: string | null
          unit?: string
          user_id?: string
          weekly_target?: number | null
        }
        Relationships: []
      }
      nirvana_entries: {
        Row: {
          average_heart_rate: number | null
          created_at: string
          date: string
          id: string
          max_heart_rate: number | null
          notes: string | null
          session_count: number | null
          total_calories_burned: number | null
          total_duration_minutes: number | null
          user_id: string
        }
        Insert: {
          average_heart_rate?: number | null
          created_at?: string
          date: string
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          session_count?: number | null
          total_calories_burned?: number | null
          total_duration_minutes?: number | null
          user_id: string
        }
        Update: {
          average_heart_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          session_count?: number | null
          total_calories_burned?: number | null
          total_duration_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      nirvana_progress: {
        Row: {
          achieved_date: string
          created_at: string
          id: string
          improvement_percentage: number | null
          milestone_type: string
          milestone_value: number | null
          notes: string | null
          previous_best: number | null
          user_id: string
        }
        Insert: {
          achieved_date: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          milestone_type: string
          milestone_value?: number | null
          notes?: string | null
          previous_best?: number | null
          user_id: string
        }
        Update: {
          achieved_date?: string
          created_at?: string
          id?: string
          improvement_percentage?: number | null
          milestone_type?: string
          milestone_value?: number | null
          notes?: string | null
          previous_best?: number | null
          user_id?: string
        }
        Relationships: []
      }
      nirvana_sessions: {
        Row: {
          body_parts: string[] | null
          calories_burned: number | null
          created_at: string
          duration_minutes: number | null
          exercises_completed: Json | null
          fatigue_level: number | null
          id: string
          nirvana_entry_id: string
          performance_rating: number | null
          session_number: number
          session_type: string | null
          user_id: string
        }
        Insert: {
          body_parts?: string[] | null
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          fatigue_level?: number | null
          id?: string
          nirvana_entry_id: string
          performance_rating?: number | null
          session_number: number
          session_type?: string | null
          user_id: string
        }
        Update: {
          body_parts?: string[] | null
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          exercises_completed?: Json | null
          fatigue_level?: number | null
          id?: string
          nirvana_entry_id?: string
          performance_rating?: number | null
          session_number?: number
          session_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nirvana_sessions_nirvana_entry_id_fkey"
            columns: ["nirvana_entry_id"]
            isOneToOne: false
            referencedRelation: "nirvana_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          bmr: number | null
          created_at: string
          display_name: string | null
          email: string
          gender: string | null
          height: number | null
          id: string
          settings: Json | null
          tdee: number | null
          updated_at: string
          user_id: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          bmr?: number | null
          created_at?: string
          display_name?: string | null
          email: string
          gender?: string | null
          height?: number | null
          id?: string
          settings?: Json | null
          tdee?: number | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          bmr?: number | null
          created_at?: string
          display_name?: string | null
          email?: string
          gender?: string | null
          height?: number | null
          id?: string
          settings?: Json | null
          tdee?: number | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      weekly_entries: {
        Row: {
          achievements: Json | null
          challenges: Json | null
          created_at: string
          goals: Json | null
          id: string
          next_week_focus: string | null
          overall_rating: number | null
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          achievements?: Json | null
          challenges?: Json | null
          created_at?: string
          goals?: Json | null
          id?: string
          next_week_focus?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          achievements?: Json | null
          challenges?: Json | null
          created_at?: string
          goals?: Json | null
          id?: string
          next_week_focus?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_body_part_correlation: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: Json
      }
      get_user_progress_summary: {
        Args: { p_days?: number; p_user_id: string }
        Returns: Json
      }
      get_weekly_completion_rate: {
        Args: { p_user_id: string; p_week_start?: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const