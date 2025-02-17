import { supabase, handleSupabaseError } from './supabase';
import type { Database } from '../types/supabase';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export const goalService = {
  async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('target_date', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getGoalById(goalId: string): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async createGoal(goal: GoalInsert): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateGoal(goalId: string, updates: GoalUpdate): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) handleSupabaseError(error);
  },

  async getActiveGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('target_date', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getCompletedGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('target_date', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async updateGoalStatus(
    goalId: string,
    status: Goal['status'],
    currentValue?: number
  ): Promise<Goal> {
    const updates: GoalUpdate = { status };
    if (currentValue !== undefined) {
      updates.current_value = currentValue;
    }
    return this.updateGoal(goalId, updates);
  },

  async getGoalsByMetricType(
    userId: string,
    metricType: Goal['metric_type']
  ): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_type', metricType)
      .order('target_date', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getOverdueGoals(userId: string): Promise<Goal[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .lt('target_date', today)
      .order('target_date', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },
}; 