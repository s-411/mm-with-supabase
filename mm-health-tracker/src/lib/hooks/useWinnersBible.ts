'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useApp } from '@/lib/context-supabase';
import { WinnersBibleService, WinnersBibleImageData } from '@/lib/services/winners-bible.service';
import { DailyService } from '@/lib/services/daily.service';
import { ProfileService } from '@/lib/services/profile.service';

async function getWinnersBibleService(authUserId: string): Promise<WinnersBibleService> {
  if (!authUserId) throw new Error('Not authenticated');

  // Get the user's profile ID for database operations
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(authUserId);

  if (!profile) throw new Error('Profile not found');

  // Pass both profile.id (for DB) and authUserId (for storage)
  return new WinnersBibleService(supabase, profile.id, authUserId);
}

async function getDailyService(userId: string): Promise<DailyService> {
  if (!userId) throw new Error('Not authenticated');

  // Just use the standard supabase client - no token needed
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new DailyService(supabase, profile.id);
}

/**
 * Hook for managing Winners Bible images
 */
export function useWinnersBibleImages() {
  const { user } = useApp();
  const [images, setImages] = useState<WinnersBibleImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    if (!user?.id) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = await getWinnersBibleService(user.id);
      const data = await service.getImages();
      setImages(data);
      setError(null);
    } catch (err) {
      console.error('Error loading Winners Bible images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const uploadImage = useCallback(async (file: File) => {
    if (!user?.id) throw new Error('Not authenticated');
    const service = await getWinnersBibleService(user.id);
    const newImage = await service.uploadImage(file);
    setImages(prev => [...prev, newImage]);
    return newImage;
  }, [user?.id]);

  const deleteImage = useCallback(async (imageId: string) => {
    if (!user?.id) throw new Error('Not authenticated');
    const service = await getWinnersBibleService(user.id);
    await service.deleteImage(imageId);
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, [user?.id]);

  const reorderImages = useCallback(async (imageIds: string[]) => {
    if (!user?.id) throw new Error('Not authenticated');
    const service = await getWinnersBibleService(user.id);
    await service.reorderImages(imageIds);
    await loadImages(); // Reload to get updated order
  }, [user?.id, loadImages]);

  return {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    reorderImages,
    reload: loadImages
  };
}

/**
 * Hook for managing Winners Bible viewing status for a specific date
 */
export function useWinnersBibleStatus(date: string) {
  const { user } = useApp();
  const [status, setStatus] = useState({
    morningCompleted: false,
    nightCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!user?.id) {
      setStatus({ morningCompleted: false, nightCompleted: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = await getDailyService(user.id);
      const entry = await service.getByDate(date);

      setStatus({
        morningCompleted: entry?.winners_bible_morning || false,
        nightCompleted: entry?.winners_bible_night || false
      });
      setError(null);
    } catch (err) {
      console.error('Error loading Winners Bible status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load status');
    } finally {
      setLoading(false);
    }
  }, [user?.id, date]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const markAsViewed = useCallback(async (timeOfDay: 'morning' | 'night') => {
    if (!user?.id) throw new Error('Not authenticated');
    const service = await getDailyService(user.id);
    await service.markWinnersBibleViewed(date, timeOfDay);

    setStatus(prev => ({
      ...prev,
      [timeOfDay === 'morning' ? 'morningCompleted' : 'nightCompleted']: true
    }));
  }, [user?.id, date]);

  return {
    status,
    loading,
    error,
    markAsViewed,
    reload: loadStatus
  };
}
