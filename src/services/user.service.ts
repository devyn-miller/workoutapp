import { supabase, handleSupabaseError } from './supabase';
import type { Database } from '../types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  async getUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async createUser(user: UserInsert): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateUser(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateUserPreferences(
    userId: string,
    preferences: User['preferences']
  ): Promise<User> {
    return this.updateUser(userId, { preferences });
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) handleSupabaseError(error);
  },
}; 