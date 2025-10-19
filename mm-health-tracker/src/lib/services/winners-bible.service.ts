import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

type WinnersBibleImage = Database['public']['Tables']['winners_bible_images']['Row'];
type WinnersBibleImageInsert = Database['public']['Tables']['winners_bible_images']['Insert'];

export interface WinnersBibleImageData {
  id: string;
  name: string;
  url: string; // Public URL from Supabase Storage
  mimeType: string;
  sizeBytes: number;
  displayOrder: number;
  createdAt: string;
}

export class WinnersBibleService {
  private readonly STORAGE_BUCKET = 'winners-bible';

  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  /**
   * Get all Winners Bible images for the user
   */
  async getImages(): Promise<WinnersBibleImageData[]> {
    const { data, error } = await this.supabase
      .from('winners_bible_images')
      .select('*')
      .eq('user_id', this.userId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch Winners Bible images: ${error.message}`);
    }

    // Get public URLs for all images
    const imagesWithUrls = await Promise.all(
      (data || []).map(async (img) => {
        const { data: urlData } = this.supabase.storage
          .from(this.STORAGE_BUCKET)
          .getPublicUrl(img.storage_path);

        return {
          id: img.id,
          name: img.name,
          url: urlData.publicUrl,
          mimeType: img.mime_type,
          sizeBytes: img.size_bytes,
          displayOrder: img.display_order,
          createdAt: img.created_at
        };
      })
    );

    return imagesWithUrls;
  }

  /**
   * Upload a new Winners Bible image
   */
  async uploadImage(
    file: File,
    displayOrder?: number
  ): Promise<WinnersBibleImageData> {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const storagePath = `${this.userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // If no display order provided, get the next available order
    let order = displayOrder;
    if (order === undefined) {
      const { data: existingImages } = await this.supabase
        .from('winners_bible_images')
        .select('display_order')
        .eq('user_id', this.userId)
        .order('display_order', { ascending: false })
        .limit(1);

      order = existingImages && existingImages.length > 0
        ? existingImages[0].display_order + 1
        : 0;
    }

    // Create database record
    const { data, error } = await this.supabase
      .from('winners_bible_images')
      .insert({
        user_id: this.userId,
        name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        display_order: order
      })
      .select()
      .single();

    if (error) {
      // If DB insert fails, try to clean up uploaded file
      await this.supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([storagePath]);
      throw new Error(`Failed to save image metadata: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(data.storage_path);

    return {
      id: data.id,
      name: data.name,
      url: urlData.publicUrl,
      mimeType: data.mime_type,
      sizeBytes: data.size_bytes,
      displayOrder: data.display_order,
      createdAt: data.created_at
    };
  }

  /**
   * Delete a Winners Bible image
   */
  async deleteImage(imageId: string): Promise<void> {
    // Get the image record to find storage path
    const { data: image, error: fetchError } = await this.supabase
      .from('winners_bible_images')
      .select('storage_path')
      .eq('id', imageId)
      .eq('user_id', this.userId)
      .single();

    if (fetchError || !image) {
      throw new Error('Image not found');
    }

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .remove([image.storage_path]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete database record
    const { error: deleteError } = await this.supabase
      .from('winners_bible_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', this.userId);

    if (deleteError) {
      throw new Error(`Failed to delete image: ${deleteError.message}`);
    }
  }

  /**
   * Reorder Winners Bible images
   */
  async reorderImages(imageIds: string[]): Promise<void> {
    const updates = imageIds.map((id, index) => ({
      id,
      display_order: index
    }));

    // Update all at once
    for (const update of updates) {
      const { error } = await this.supabase
        .from('winners_bible_images')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
        .eq('user_id', this.userId);

      if (error) {
        throw new Error(`Failed to reorder images: ${error.message}`);
      }
    }
  }
}
