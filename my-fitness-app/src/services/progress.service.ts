import { supabase, handleSupabaseError } from './supabase';
import type { Database } from '../types/supabase';

type Progress = Database['public']['Tables']['progress']['Row'];
type ProgressInsert = Database['public']['Tables']['progress']['Insert'];
type ProgressUpdate = Database['public']['Tables']['progress']['Update'];

export const progressService = {
  async getProgress(userId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getProgressById(progressId: string): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', progressId)
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async createProgress(progress: ProgressInsert): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .insert(progress)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async updateProgress(progressId: string, updates: ProgressUpdate): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .update(updates)
      .eq('id', progressId)
      .select()
      .single();

    if (error) handleSupabaseError(error);
    return data;
  },

  async deleteProgress(progressId: string): Promise<void> {
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('id', progressId);

    if (error) handleSupabaseError(error);
  },

  async getProgressByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) handleSupabaseError(error);
    return data || [];
  },

  async getLatestProgress(userId: string): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for no rows returned
      handleSupabaseError(error);
    }

    return data || null;
  },

  async uploadProgressPhoto(
    userId: string,
    file: File,
    type: 'front' | 'back' | 'side'
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
    const filePath = `progress-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, file);

    if (uploadError) handleSupabaseError(uploadError);

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteProgressPhoto(photoUrl: string): Promise<void> {
    const path = photoUrl.split('/').pop();
    if (!path) throw new Error('Invalid photo URL');

    const { error } = await supabase.storage
      .from('progress-photos')
      .remove([path]);

    if (error) handleSupabaseError(error);
  },
}; 