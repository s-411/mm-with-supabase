'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { WinnersBibleService, WinnersBibleImageData } from '@/lib/services/winners-bible.service';
import { DailyService } from '@/lib/services/daily.service';
import { ProfileService } from '@/lib/services/profile.service';

async function getWinnersBibleService(getToken: any, userId: string): Promise<WinnersBibleService> {
  if (!userId) throw new Error('Not authenticated');

  const token = await getToken({ template: 'supabase' });
  if (!token) throw new Error('No auth token');

  const supabase = createClerkSupabaseClient(token);
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new WinnersBibleService(supabase, profile.id);
}

async function getDailyService(getToken: any, userId: string): Promise<DailyService> {
  if (!userId) throw new Error('Not authenticated');

  const token = await getToken({ template: 'supabase' });
  if (!token) throw new Error('No auth token');

  const supabase = createClerkSupabaseClient(token);
  const profileService = new ProfileService(supabase);
  const profile = await profileService.get(userId);

  if (!profile) throw new Error('Profile not found');

  return new DailyService(supabase, profile.id);
}

/**
 * Hook for managing Winners Bible images
 */
export function useWinnersBibleImages() {
  const { getToken, userId } = useAuth();
  const [images, setImages] = useState<WinnersBibleImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    if (!userId) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = await getWinnersBibleService(getToken, userId);
      const data = await service.getImages();
      setImages(data);
      setError(null);
    } catch (err) {
      console.error('Error loading Winners Bible images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [getToken, userId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const uploadImage = useCallback(async (file: File) => {
    const service = await getWinnersBibleService(getToken, userId);
    const newImage = await service.uploadImage(file);
    setImages(prev => [...prev, newImage]);
    return newImage;
  }, [getToken, userId]);

  const deleteImage = useCallback(async (imageId: string) => {
    const service = await getWinnersBibleService(getToken, userId);
    await service.deleteImage(imageId);
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, [getToken, userId]);

  const reorderImages = useCallback(async (imageIds: string[]) => {
    const service = await getWinnersBibleService(getToken, userId);
    await service.reorderImages(imageIds);
    await loadImages(); // Reload to get updated order
  }, [getToken, userId, loadImages]);

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
  const { getToken, userId } = useAuth();
  const [status, setStatus] = useState({
    morningCompleted: false,
    nightCompleted: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!userId) {
      setStatus({ morningCompleted: false, nightCompleted: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const service = await getDailyService(getToken, userId);
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
  }, [getToken, userId, date]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const markAsViewed = useCallback(async (timeOfDay: 'morning' | 'night') => {
    const service = await getDailyService(getToken, userId);
    await service.markWinnersBibleViewed(date, timeOfDay);

    setStatus(prev => ({
      ...prev,
      [timeOfDay === 'morning' ? 'morningCompleted' : 'nightCompleted']: true
    }));
  }, [getToken, userId, date]);

  return {
    status,
    loading,
    error,
    markAsViewed,
    reload: loadStatus
  };
}
