export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          clerk_user_id: string;
          plan_type: 'free' | 'pro';
          status: 'active' | 'cancelled' | 'terminated';
          billing_key: string | null;
          quota: number;
          next_payment_date: string | null;
          last_payment_date: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          plan_type?: 'free' | 'pro';
          status?: 'active' | 'cancelled' | 'terminated';
          billing_key?: string | null;
          quota?: number;
          next_payment_date?: string | null;
          last_payment_date?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          plan_type?: 'free' | 'pro';
          status?: 'active' | 'cancelled' | 'terminated';
          billing_key?: string | null;
          quota?: number;
          next_payment_date?: string | null;
          last_payment_date?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          clerk_user_id: string;
          name: string;
          birth_date: string;
          birth_time: string | null;
          gender: 'male' | 'female';
          result_markdown: string;
          model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          name: string;
          birth_date: string;
          birth_time?: string | null;
          gender: 'male' | 'female';
          result_markdown: string;
          model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          name?: string;
          birth_date?: string;
          birth_time?: string | null;
          gender?: 'male' | 'female';
          result_markdown?: string;
          model_used?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      decrement_quota_and_insert_analysis: {
        Args: {
          p_clerk_user_id: string;
          p_name: string;
          p_birth_date: string;
          p_birth_time: string | null;
          p_gender: 'male' | 'female';
          p_result_markdown: string;
          p_model_used: 'gemini-2.5-flash' | 'gemini-2.5-pro';
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type SupabaseUserMetadata = Record<string, unknown>;
