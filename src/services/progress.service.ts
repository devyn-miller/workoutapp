export class ProgressService {
  async uploadProgressPhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `progress-photos/${fileName}`;

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