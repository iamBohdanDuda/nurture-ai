// Auto-generated types for Supabase tables
// Replace this with `npx supabase gen types typescript` when project is set up

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          pregnancy_start_date: string;
          blood_type: string | null;
          emergency_contact: string | null;
          subscription_tier: 'free' | 'premium';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          pregnancy_start_date: string;
          blood_type?: string | null;
          emergency_contact?: string | null;
          subscription_tier?: 'free' | 'premium';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          pregnancy_start_date?: string;
          blood_type?: string | null;
          emergency_contact?: string | null;
          subscription_tier?: 'free' | 'premium';
          created_at?: string;
        };
        Relationships: [];
      };
      user_memory: {
        Row: {
          user_id: string;
          markdown_summary: string;
          last_updated: string;
        };
        Insert: {
          user_id: string;
          markdown_summary: string;
          last_updated?: string;
        };
        Update: {
          user_id?: string;
          markdown_summary?: string;
          last_updated?: string;
        };
        Relationships: [];
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      health_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: 'weight' | 'calories' | 'water' | 'symptom' | 'vitamin';
          value: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: 'weight' | 'calories' | 'water' | 'symptom' | 'vitamin';
          value: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: 'weight' | 'calories' | 'water' | 'symptom' | 'vitamin';
          value?: number;
          notes?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          reminder_type: 'medication' | 'hydration' | 'appointment';
          cron_schedule: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          reminder_type: 'medication' | 'hydration' | 'appointment';
          cron_schedule?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          reminder_type?: 'medication' | 'hydration' | 'appointment';
          cron_schedule?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      domain_knowledge: {
        Row: {
          id: string;
          topic: string | null;
          content: string | null;
          embedding: number[];
        };
        Insert: {
          id?: string;
          topic?: string | null;
          content?: string | null;
          embedding: number[];
        };
        Update: {
          id?: string;
          topic?: string | null;
          content?: string | null;
          embedding?: number[];
        };
        Relationships: [];
      };
      symptom_logs: {
        Row: {
          id: string;
          user_id: string;
          symptom_name: string;
          severity: number; // 1-5
          pregnancy_week: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symptom_name: string;
          severity: number;
          pregnancy_week: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symptom_name?: string;
          severity?: number;
          pregnancy_week?: number;
          notes?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_name: string;
          description: string | null;
          calories: number;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          photo_url: string | null;
          is_pregnancy_safe: boolean;
          safety_analysis: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_name: string;
          description?: string | null;
          calories?: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          photo_url?: string | null;
          is_pregnancy_safe?: boolean;
          safety_analysis?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_name?: string;
          description?: string | null;
          calories?: number;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          photo_url?: string | null;
          is_pregnancy_safe?: boolean;
          safety_analysis?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      vitamin_logs: {
        Row: {
          id: string;
          user_id: string;
          vitamin_name: string;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vitamin_name: string;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vitamin_name?: string;
          notes?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      hydration_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          daily_target_ml: number;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          daily_target_ml?: number;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount_ml?: number;
          daily_target_ml?: number;
          logged_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          pregnancy_week: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          pregnancy_week: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          weight_kg?: number;
          pregnancy_week?: number;
          notes?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
      kick_logs: {
        Row: {
          id: string;
          user_id: string;
          kick_count: number;
          duration_seconds: number;
          pregnancy_week: number;
          notes: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kick_count: number;
          duration_seconds: number;
          pregnancy_week: number;
          notes?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kick_count?: number;
          duration_seconds?: number;
          pregnancy_week?: number;
          notes?: string | null;
          logged_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row'];
export type ChatMessage = Database['public']['Tables']['chat_history']['Row'];
export type HealthMetric = Database['public']['Tables']['health_metrics']['Row'];
export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type SymptomLog = Database['public']['Tables']['symptom_logs']['Row'];
export type MealLog = Database['public']['Tables']['meal_logs']['Row'];
export type VitaminLog = Database['public']['Tables']['vitamin_logs']['Row'];
export type HydrationLog = Database['public']['Tables']['hydration_logs']['Row'];
export type WeightLog = Database['public']['Tables']['weight_logs']['Row'];
export type KickLog = Database['public']['Tables']['kick_logs']['Row'];
