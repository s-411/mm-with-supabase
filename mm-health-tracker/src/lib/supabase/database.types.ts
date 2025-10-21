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
      body_part_mappings: {
        Row: {
          body_parts: Json | null
          created_at: string | null
          id: string
          intensity: string | null
          session_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_parts?: Json | null
          created_at?: string | null
          id?: string
          intensity?: string | null
          session_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_parts?: Json | null
          created_at?: string | null
          id?: string
          intensity?: string | null
          session_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_part_mappings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calorie_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          {
            foreignKeyName: "calorie_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compounds: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_metrics: {
        Row: {
          category: string | null
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
          date?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_entries: {
        Row: {
          created_at: string | null
          date: string
          deep_work_completed: boolean | null
          id: string
          updated_at: string | null
          user_id: string
          weight: number | null
          winners_bible_morning: boolean | null
          winners_bible_night: boolean | null
        }
        Insert: {
          created_at?: string | null
          date: string
          deep_work_completed?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
          weight?: number | null
          winners_bible_morning?: boolean | null
          winners_bible_night?: boolean | null
        }
        Update: {
          created_at?: string | null
          date?: string
          deep_work_completed?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
          weight?: number | null
          winners_bible_morning?: boolean | null
          winners_bible_night?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_entries: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          daily_entry_id: string | null
          date: string
          duration_minutes: number | null
          exercise_type: string
          id: string
          intensity: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          daily_entry_id?: string | null
          date: string
          duration_minutes?: number | null
          exercise_type: string
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          daily_entry_id?: string | null
          date?: string
          duration_minutes?: number | null
          exercise_type?: string
          id?: string
          intensity?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_entries_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_templates: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          id: string
          name: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          name: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          name?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      injection_entries: {
        Row: {
          compound_name: string
          created_at: string | null
          date: string
          dosage: number
          id: string
          injection_site: string | null
          notes: string | null
          time_of_day: string | null
          unit: string
          user_id: string
        }
        Insert: {
          compound_name: string
          created_at?: string | null
          date: string
          dosage: number
          id?: string
          injection_site?: string | null
          notes?: string | null
          time_of_day?: string | null
          unit?: string
          user_id: string
        }
        Update: {
          compound_name?: string
          created_at?: string | null
          date?: string
          dosage?: number
          id?: string
          injection_site?: string | null
          notes?: string | null
          time_of_day?: string | null
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injection_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      injection_targets: {
        Row: {
          active: boolean | null
          compound_name: string
          created_at: string | null
          frequency_per_week: number
          id: string
          target_dosage: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          compound_name: string
          created_at?: string | null
          frequency_per_week: number
          id?: string
          target_dosage: number
          unit?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          compound_name?: string
          created_at?: string | null
          frequency_per_week?: number
          id?: string
          target_dosage?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injection_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mits: {
        Row: {
          completed: boolean | null
          created_at: string | null
          daily_entry_id: string | null
          date: string
          id: string
          order_index: number | null
          task_description: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          daily_entry_id?: string | null
          date: string
          id?: string
          order_index?: number | null
          task_description: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          daily_entry_id?: string | null
          date?: string
          id?: string
          order_index?: number | null
          task_description?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mits_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nirvana_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          total_sessions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nirvana_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nirvana_milestones: {
        Row: {
          category: string
          completed: boolean | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          difficulty: string
          id: string
          order_index: number | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          difficulty: string
          id?: string
          order_index?: number | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          order_index?: number | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nirvana_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nirvana_personal_records: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          notes: string | null
          previous_date: string | null
          previous_value: number | null
          record_date: string | null
          unit: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          previous_date?: string | null
          previous_value?: number | null
          record_date?: string | null
          unit: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          previous_date?: string | null
          previous_value?: number | null
          record_date?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "nirvana_personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nirvana_session_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nirvana_session_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nirvana_sessions: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          nirvana_entry_id: string
          notes: string | null
          session_number: number | null
          session_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          nirvana_entry_id: string
          notes?: string | null
          session_number?: number | null
          session_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          nirvana_entry_id?: string
          notes?: string | null
          session_number?: number | null
          session_type?: string
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
          {
            foreignKeyName: "nirvana_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active: boolean | null
          billing_date: string
          billing_frequency: string | null
          category_ids: string[] | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          billing_date: string
          billing_frequency?: string | null
          category_ids?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          billing_date?: string
          billing_frequency?: string | null
          category_ids?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string
          bmr: number
          created_at: string | null
          gender: string | null
          height: number | null
          id: string
          macro_targets: Json | null
          timezone: string | null
          tracker_settings: Json | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          auth_user_id: string
          bmr?: number
          created_at?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          macro_targets?: Json | null
          timezone?: string | null
          tracker_settings?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          auth_user_id?: string
          bmr?: number
          created_at?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          macro_targets?: Json | null
          timezone?: string | null
          tracker_settings?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      weekly_entries: {
        Row: {
          created_at: string | null
          friday_review: string | null
          id: string
          objectives: Json | null
          review_completed: boolean | null
          updated_at: string | null
          user_id: string
          week_start: string
          why_important: string | null
        }
        Insert: {
          created_at?: string | null
          friday_review?: string | null
          id?: string
          objectives?: Json | null
          review_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          week_start: string
          why_important?: string | null
        }
        Update: {
          created_at?: string | null
          friday_review?: string | null
          id?: string
          objectives?: Json | null
          review_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
          why_important?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      winners_bible_images: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          mime_type?: string
          name?: string
          size_bytes?: number
          storage_path?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_bible_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      seed_default_compounds: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: undefined
      }
      seed_default_nirvana_session_types: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      seed_default_session_types: {
        Args: Record<PropertyKey, never> | { p_user_id: string }
        Returns: undefined
      }
      seed_nirvana_defaults_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
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