import { supabase, handleSupabaseError } from './supabase';
import type { Database } from '../types/supabase';

type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
type WorkoutExerciseInsert = Database['public']['Tables']['workout_exercises']['Insert'];

export const workoutService = {
  async getWorkouts(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getWorkoutById(workoutId: string): Promise<Workout & { exercises: WorkoutExercise[] }> {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();

    if (workoutError) handleSupabaseError(workoutError);

    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('order');

    if (exercisesError) handleSupabaseError(exercisesError);

    return {
      ...workout,
      exercises: exercises || [],
    };
  },

  async createWorkout(workout: WorkoutInsert): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateWorkout(workoutId: string, updates: WorkoutUpdate): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    // First delete associated workout exercises
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', workoutId);

    if (exercisesError) handleSupabaseError(exercisesError);

    // Then delete the workout
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) handleSupabaseError(error);
  },

  async addExerciseToWorkout(exercise: WorkoutExerciseInsert): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(exercise)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateWorkoutStatus(
    workoutId: string,
    status: Workout['status']
  ): Promise<Workout> {
    return this.updateWorkout(workoutId, { status });
  },

  async getWorkoutsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async updateExerciseInWorkout(
    workoutId: string,
    exerciseId: string,
    updates: Partial<WorkoutExercise>
  ): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('workout_id', workoutId)
      .eq('id', exerciseId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async removeExerciseFromWorkout(workoutId: string, exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', workoutId)
      .eq('id', exerciseId);

    if (error) handleSupabaseError(error);
  },
}; 