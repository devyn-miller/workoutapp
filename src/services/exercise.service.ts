import { supabase, handleSupabaseError } from './supabase';
import type { Database } from '../types/supabase';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

export const exerciseService = {
  async getExercises(options?: {
    category?: Exercise['category'];
    userId?: string;
    isSystem?: boolean;
  }): Promise<Exercise[]> {
    let query = supabase.from('exercises').select('*');

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (typeof options?.isSystem === 'boolean') {
      query = query.eq('is_system', options.isSystem);
    }

    const { data, error } = await query.order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getExerciseById(exerciseId: string): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async createExercise(exercise: ExerciseInsert): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exercise)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateExercise(exerciseId: string, updates: ExerciseUpdate): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async deleteExercise(exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) handleSupabaseError(error);
  },

  async searchExercises(
    searchTerm: string,
    options?: {
      category?: Exercise['category'];
      userId?: string;
      isSystem?: boolean;
    }
  ): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .ilike('name', `%${searchTerm}%`);

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (typeof options?.isSystem === 'boolean') {
      query = query.eq('is_system', options.isSystem);
    }

    const { data, error } = await query.order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .contains('muscle_groups', [muscleGroup])
      .order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getExercisesByDifficulty(
    difficultyLevel: Exercise['difficulty_level']
  ): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty_level', difficultyLevel)
      .order('name');

    if (error) handleSupabaseError(error);
    return data || [];
  },
}; 