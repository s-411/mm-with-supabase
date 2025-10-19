'use client';

import React, { useState, useEffect } from 'react';
import { winnersBibleStorage, dailyEntryStorage, timezoneStorage } from '@/lib/storage';
import { WinnersBibleImage } from '@/types';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CheckCircleIcon,
  EyeIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

export default function WinnersBiblePage() {
  const [images, setImages] = useState<WinnersBibleImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewingStatus, setViewingStatus] = useState({ morningCompleted: false, nightCompleted: false });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionType, setCompletionType] = useState<'morning' | 'night'>('morning');

  const currentDate = timezoneStorage.getCurrentDate();

  useEffect(() => {
    const loadedImages = winnersBibleStorage.getImages();
    setImages(loadedImages);

    // Load viewing status for today
    const status = dailyEntryStorage.getWinnersBibleStatus(currentDate);
    setViewingStatus(status);
  }, [currentDate]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (images.length === 0) return;

    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
    } else {
      setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    }
  };

  const markAsViewed = (timeOfDay: 'morning' | 'night') => {
    // Mark in daily entry
    dailyEntryStorage.markWinnersBibleViewed(currentDate, timeOfDay);

    // Mark in Winners Bible storage as well
    winnersBibleStorage.markViewed(currentDate, timeOfDay);

    // Update local state
    setViewingStatus(prev => ({
      ...prev,
      [timeOfDay === 'morning' ? 'morningCompleted' : 'nightCompleted']: true
    }));

    // Show completion modal
    setCompletionType(timeOfDay);
    setShowCompletionModal(true);
    setTimeout(() => setShowCompletionModal(false), 2000);
  };

  const currentImage = images[currentImageIndex];

  if (images.length === 0) {
    return (
      <div className="p-6 md:p-8 w-[90%] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading mb-2">Winners Bible</h1>
          <p className="text-mm-gray">Your motivational images for daily inspiration</p>
        </div>

        <div className="card-mm p-8 text-center">
          <PhotoIcon className="w-16 h-16 text-mm-gray/50 mx-auto mb-4" />
          <h2 className="text-xl font-heading text-mm-white mb-2">No Images Yet</h2>
          <p className="text-mm-gray mb-6">
            Add images to your Winners Bible in Settings to start your daily motivation routine.
          </p>
          <a
            href="/settings"
            className="btn-mm py-3 px-6 inline-block"
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-mm-dark max-w-[920px] mx-auto">
      {/* Header */}
      <div className="p-4 bg-mm-dark2 border-b border-mm-gray/20 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading text-mm-white">Winners Bible</h1>
          <p className="text-sm text-mm-gray">
            Image {currentImageIndex + 1} of {images.length}
          </p>
        </div>

        {/* Daily Completion Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SunIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-mm-gray">Morning</span>
            {viewingStatus.morningCompleted ? (
              <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-mm-gray/50" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <MoonIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-mm-gray">Night</span>
            {viewingStatus.nightCompleted ? (
              <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-mm-gray/50" />
            )}
          </div>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <img
          src={`data:${currentImage.mimeType};base64,${currentImage.base64Data}`}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full">
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-mm-blue' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-mm-dark2 border-t border-mm-gray/20">
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => markAsViewed('morning')}
            disabled={viewingStatus.morningCompleted}
            className={`px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
              viewingStatus.morningCompleted
                ? 'bg-green-500/20 text-green-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            <SunIcon className="w-5 h-5" />
            {viewingStatus.morningCompleted ? 'Morning Complete' : 'Mark Morning Complete'}
          </button>

          <button
            onClick={() => markAsViewed('night')}
            disabled={viewingStatus.nightCompleted}
            className={`px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
              viewingStatus.nightCompleted
                ? 'bg-green-500/20 text-green-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <MoonIcon className="w-5 h-5" />
            {viewingStatus.nightCompleted ? 'Night Complete' : 'Mark Night Complete'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/daily"
            className="text-mm-blue hover:text-mm-blue/80 text-sm underline"
          >
            Back to Daily Tracker
          </a>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-mm-dark border border-green-500/30 rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <CheckCircleIconSolid className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-heading text-mm-white mb-2">
                {completionType === 'morning' ? 'Morning' : 'Night'} Viewing Complete!
              </h3>
              <p className="text-sm text-mm-gray">
                Great job staying motivated with your Winners Bible
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}