import { supabase } from 'src/boot/supabase';
import type { Progress } from 'src/types/supabase';

class ProgressService {
  /**
   * Get all progress entries for a user, ordered by date descending
   */
  async getProgress(userId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get a specific progress entry by ID
   */
  async getProgressById(id: string): Promise<Progress | null> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Create a new progress entry
   */
  async createProgress(progress: Progress): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .insert(progress)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update an existing progress entry
   */
  async updateProgress(id: string, progress: Partial<Progress>): Promise<Progress> {
    const { data, error } = await supabase
      .from('progress')
      .update(progress)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete a progress entry
   */
  async deleteProgress(id: string): Promise<void> {
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  /**
   * Upload a progress photo and return the URL
   */
  async uploadProgressPhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${userId}/\${Date.now()}.\${fileExt}\`;
    const filePath = \`progress-photos/\${fileName}\`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Delete a progress photo from storage
   */
  async deleteProgressPhoto(photoUrl: string): Promise<void> {
    const path = photoUrl.split('/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from('progress-photos')
      .remove([path]);

    if (error) {
      throw error;
    }
  }
}

export const progressService = new ProgressService(); 