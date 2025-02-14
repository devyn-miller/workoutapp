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
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          preferences: {
            units: 'metric' | 'imperial';
            workout_reminder_time?: string;
            theme: 'light' | 'dark' | 'system';
          };
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          template_id?: string;
          name: string;
          date: string;
          duration: number;
          calories_burned?: number;
          notes?: string;
          status: 'planned' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workouts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>;
      };
      exercises: {
        Row: {
          id: string;
          user_id?: string;
          name: string;
          category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'hiit';
          muscle_groups: string[];
          description: string;
          difficulty_level: 'beginner' | 'intermediate' | 'advanced';
          equipment_required?: string[];
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          sets: {
            set_number: number;
            reps?: number;
            weight?: number;
            duration?: number;
            rir?: number;
            set_type: 'normal' | 'warmup' | 'dropset' | 'failure';
            completed: boolean;
            rest_time?: number;
          }[];
          order: number;
          is_superset: boolean;
          superset_group_id?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workout_exercises']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workout_exercises']['Insert']>;
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          metrics: {
            weight?: number;
            body_fat?: number;
            measurements?: {
              chest?: number;
              waist?: number;
              hips?: number;
              biceps?: number;
              thighs?: number;
            };
          };
          photos?: {
            front?: string;
            back?: string;
            side?: string;
          };
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['progress']['Insert']>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          target_date: string;
          status: 'in_progress' | 'completed' | 'abandoned';
          metric_type: 'weight' | 'reps' | 'duration' | 'body_fat' | 'measurement';
          target_value: number;
          current_value?: number;
          reminder_frequency?: 'daily' | 'weekly' | 'monthly';
          last_reminder_sent?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
    };
  };
} 