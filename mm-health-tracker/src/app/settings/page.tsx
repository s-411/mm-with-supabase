'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useProfile } from '@/lib/context-supabase';
import { useCompounds, useFoodTemplates, useNirvanaSessionTypes, useMacroTargets, useTrackerSettings } from '@/lib/hooks/useSettings';
import type { Database } from '@/lib/supabase/database.types';
import { profileStorage, dataExport, compoundStorage, foodTemplateStorage, FoodTemplate, injectionTargetStorage, nirvanaSessionTypesStorage, timezoneStorage } from '@/lib/storage';
import { useWinnersBibleImages } from '@/lib/hooks/useWinnersBible';
import { UserProfile, DailyTrackerSettings, InjectionTarget } from '@/types';
import {
  UserIcon,
  BeakerIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  FireIcon,
  CalendarDaysIcon,
  SparklesIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFirstTime = searchParams.get('firstTime') === 'true';
  const { signOut } = useClerk();

  const { profile, updateProfile: updateSupabaseProfile, isLoading: profileLoading } = useProfile();
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Local state for profile form inputs
  const [localProfile, setLocalProfile] = useState({
    bmr: profile?.bmr || 0,
    gender: profile?.gender || 'male',
    height: profile?.height || null,
    weight: profile?.weight || null,
  });
  const [profileChanged, setProfileChanged] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Supabase hooks for settings
  const { compounds, addCompound: addCompoundToSupabase, removeCompound: removeCompoundFromSupabase } = useCompounds();
  const { templates: foodTemplates, addTemplate: addTemplateToSupabase, removeTemplate: removeTemplateFromSupabase } = useFoodTemplates();
  const { sessionTypes: nirvanaSessionTypes, addSessionType: addSessionTypeToSupabase, removeSessionType: removeSessionTypeFromSupabase } = useNirvanaSessionTypes();
  const { macroTargets: supabaseMacroTargets, updateMacroTargets: updateSupabaseMacroTargets } = useMacroTargets();
  const { trackerSettings: supabaseTrackerSettings, updateTrackerSettings: updateSupabaseTrackerSettings } = useTrackerSettings();
  const { images: winnersBibleImages, uploadImage, deleteImage, loading: winnersBibleLoading } = useWinnersBibleImages();

  const [newCompound, setNewCompound] = useState('');
  const [showDeleteWarning, setShowDeleteWarning] = useState<string | null>(null);
  const [showDataClearWarning, setShowDataClearWarning] = useState(false);

  // Local state for macro targets form
  const [localMacroTargets, setLocalMacroTargets] = useState({ calories: '', carbs: '', protein: '', fat: '' });
  const [macroTargetsChanged, setMacroTargetsChanged] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: ''
  });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [dailyTrackerSettings, setDailyTrackerSettings] = useState<DailyTrackerSettings>({
    enableWeight: true,
    enableDeepWork: true,
    enableCustomMetrics: false,
    customMetrics: [
      { id: 'sleep', name: 'Sleep Hours', type: 'number', enabled: false, unit: 'hours' },
      { id: 'mood', name: 'Mood Rating', type: 'scale', enabled: false, min: 1, max: 10 },
      { id: 'energy', name: 'Energy Level', type: 'scale', enabled: false, min: 1, max: 10 },
      { id: 'hydration', name: 'Water Intake', type: 'number', enabled: false, unit: 'glasses' }
    ]
  });
  const [injectionTargets, setInjectionTargets] = useState<InjectionTarget[]>([]);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>('');

  // Nirvana session types state
  const [newSessionType, setNewSessionType] = useState('');
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<InjectionTarget | null>(null);
  const [newTarget, setNewTarget] = useState({
    compound: '',
    doseAmount: '',
    unit: 'mg',
    frequency: ''
  });

  // Winners Bible state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync local state when profile loads from Supabase
  useEffect(() => {
    if (profile) {
      setLocalProfile({
        bmr: profile.bmr || 0,
        gender: profile.gender || 'male',
        height: profile.height || null,
        weight: profile.weight || null,
      });
    }
  }, [profile]);

  // Sync local macro targets when Supabase data loads
  useEffect(() => {
    setLocalMacroTargets(supabaseMacroTargets);
  }, [supabaseMacroTargets]);

  // Sync local tracker settings when Supabase data loads
  useEffect(() => {
    if (supabaseTrackerSettings && Object.keys(supabaseTrackerSettings).length > 0) {
      setDailyTrackerSettings(supabaseTrackerSettings);
    }
  }, [supabaseTrackerSettings]);

  // Sync timezone from profile
  useEffect(() => {
    if (profile?.timezone) {
      setUserTimezone(profile.timezone);
    }
  }, [profile?.timezone]);

  useEffect(() => {
    // Check if profile is complete
    const profileComplete = !!(
      profile?.bmr && profile.bmr > 0 &&
      profile?.height && profile.height > 0 &&
      profile?.weight && profile.weight > 0 &&
      profile?.gender
    );
    setIsProfileComplete(profileComplete);

    // If profile becomes complete and user came from first-time flow, redirect to daily tracker
    if (profileComplete && isFirstTime) {
      setTimeout(() => {
        router.replace('/daily');
      }, 2000); // Give user time to see completion message
    }

    // Tracker settings are now loaded from Supabase via useTrackerSettings hook

    // Load injection targets from storage
    const storedInjectionTargets = injectionTargetStorage.get();
    setInjectionTargets(storedInjectionTargets);

    // Timezone is now loaded from profile via useProfile hook

    // Winners Bible images are now loaded from Supabase via useWinnersBibleImages hook
  }, [isFirstTime, router, profile]);

  // Update local profile state and mark as changed
  const updateLocalProfile = (updates: Partial<typeof localProfile>) => {
    setLocalProfile(prev => ({ ...prev, ...updates }));
    setProfileChanged(true);
  };

  // Save profile to Supabase
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateSupabaseProfile(localProfile);
      setProfileChanged(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const addCompound = async () => {
    if (newCompound.trim() && !compounds.some(c => c.name === newCompound.trim())) {
      try {
        await addCompoundToSupabase(newCompound.trim());
        setNewCompound('');
      } catch (error) {
        console.error('Error adding compound:', error);
        alert('Failed to add compound. Please try again.');
      }
    }
  };

  const removeCompound = (compoundId: string, compoundName: string) => {
    // Direct delete - no localStorage check needed
    confirmDeleteCompound(compoundId);
  };

  const confirmDeleteCompound = async (compoundId: string) => {
    try {
      await removeCompoundFromSupabase(compoundId);
      setShowDeleteWarning(null);
    } catch (error) {
      console.error('Error removing compound:', error);
      alert('Failed to remove compound. Please try again.');
    }
  };

  const addTemplate = async () => {
    if (newTemplate.name.trim() && newTemplate.calories.trim()) {
      try {
        await addTemplateToSupabase({
          name: newTemplate.name.trim(),
          calories: parseInt(newTemplate.calories) || 0,
          carbs: parseInt(newTemplate.carbs) || 0,
          protein: parseInt(newTemplate.protein) || 0,
          fat: parseInt(newTemplate.fat) || 0
        });
        setNewTemplate({ name: '', calories: '', carbs: '', protein: '', fat: '' });
        setShowTemplateForm(false);
      } catch (error) {
        console.error('Error adding food template:', error);
        alert('Failed to add food template. Please try again.');
      }
    }
  };

  const removeTemplate = async (templateId: string) => {
    try {
      await removeTemplateFromSupabase(templateId);
    } catch (error) {
      console.error('Error removing food template:', error);
      alert('Failed to remove food template. Please try again.');
    }
  };

  const updateDailyTrackerSetting = async (key: string, value: boolean) => {
    const updated = { ...dailyTrackerSettings, [key]: value };
    setDailyTrackerSettings(updated);
    try {
      await updateSupabaseTrackerSettings(updated);
    } catch (error) {
      console.error('Error updating tracker setting:', error);
      alert('Failed to save tracker setting. Please try again.');
    }
  };

  const toggleCustomMetric = async (metricId: string) => {
    const updated = {
      ...dailyTrackerSettings,
      customMetrics: dailyTrackerSettings.customMetrics.map(metric =>
        metric.id === metricId
          ? { ...metric, enabled: !metric.enabled }
          : metric
      )
    };
    setDailyTrackerSettings(updated);
    try {
      await updateSupabaseTrackerSettings(updated);
    } catch (error) {
      console.error('Error toggling custom metric:', error);
      alert('Failed to update custom metric. Please try again.');
    }
  };

  const updateMacroTarget = (key: string, value: string) => {
    const updated = { ...localMacroTargets, [key]: value };
    setLocalMacroTargets(updated);
    setMacroTargetsChanged(true);
  };

  const saveMacroTargets = async () => {
    try {
      await updateSupabaseMacroTargets(localMacroTargets);
      setMacroTargetsChanged(false);
      alert('Macro targets saved successfully!');
    } catch (error) {
      console.error('Error saving macro targets:', error);
      alert('Failed to save macro targets. Please try again.');
    }
  };

  const addInjectionTarget = () => {
    if (!newTarget.compound || !newTarget.doseAmount || !newTarget.frequency) return;

    const updated = injectionTargetStorage.add({
      compound: newTarget.compound,
      doseAmount: parseFloat(newTarget.doseAmount),
      unit: newTarget.unit,
      frequency: parseInt(newTarget.frequency),
      enabled: true
    });

    setInjectionTargets(updated);
    setNewTarget({ compound: '', doseAmount: '', unit: 'mg', frequency: '' });
    setShowTargetForm(false);
  };

  const updateInjectionTarget = (targetId: string, updates: Partial<InjectionTarget>) => {
    const updated = injectionTargetStorage.update(targetId, updates);
    setInjectionTargets(updated);
    setEditingTarget(null);
  };

  const removeInjectionTarget = (targetId: string) => {
    const updated = injectionTargetStorage.remove(targetId);
    setInjectionTargets(updated);
  };

  const startEditingTarget = (target: InjectionTarget) => {
    setEditingTarget(target);
    setNewTarget({
      compound: target.compound,
      doseAmount: target.doseAmount.toString(),
      unit: target.unit,
      frequency: target.frequency.toString()
    });
    setShowTargetForm(true);
  };

  const cancelTargetEdit = () => {
    setEditingTarget(null);
    setNewTarget({ compound: '', doseAmount: '', unit: 'mg', frequency: '' });
    setShowTargetForm(false);
  };

  // Nirvana session types functions
  const addSessionType = async () => {
    if (newSessionType.trim() && !nirvanaSessionTypes.some(st => st.name === newSessionType.trim())) {
      try {
        await addSessionTypeToSupabase(newSessionType.trim());
        setNewSessionType('');
      } catch (error) {
        console.error('Error adding session type:', error);
        alert('Failed to add session type. Please try again.');
      }
    }
  };

  const removeSessionType = async (sessionTypeId: string) => {
    try {
      await removeSessionTypeFromSupabase(sessionTypeId);
    } catch (error) {
      console.error('Error removing session type:', error);
      alert('Failed to remove session type. Please try again.');
    }
  };

  const exportData = () => {
    // TODO: Implement Supabase data export
    // This would require fetching all user data from Supabase and formatting it
    alert('Data Export is temporarily disabled during the Supabase migration. This feature will be re-enabled soon with enhanced cloud backup capabilities.');
  };

  const clearAllData = () => {
    // TODO: Implement Supabase data deletion
    // This would require creating a comprehensive API endpoint to delete all user data
    // For now, we'll show an alert
    alert('Clear All Data is temporarily disabled during the Supabase migration. Please contact support if you need to delete your data.');
    setShowDataClearWarning(false);
  };

  // Winners Bible functions
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      for (const file of Array.from(files)) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Please select only image files');
          continue;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          continue;
        }

        // Upload to Supabase Storage
        try {
          await uploadImage(file);
        } catch (error) {
          alert((error as Error).message);
          break;
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const removeWinnersBibleImage = async (imageId: string) => {
    try {
      await deleteImage(imageId);
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image. Please try again.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* First-Time User Welcome Banner */}
      {isFirstTime && (
        <div className="mb-6 p-4 bg-gradient-to-r from-mm-blue/20 to-mm-blue/10 border border-mm-blue/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mm-blue/20 flex items-center justify-center">
              <span className="text-mm-blue text-lg">👋</span>
            </div>
            <div>
              <h3 className="text-lg font-heading text-mm-white">Welcome to MM Health Tracker!</h3>
              <p className="text-sm text-mm-gray">
                Step 1: Complete your profile settings below so that all tracking metrics function correctly.
              </p>
            </div>
          </div>
          {isProfileComplete && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 font-semibold">
                ✅ Profile Complete! Redirecting to Daily Tracker in a moment...
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-2">Settings</h1>
        <p className="text-mm-gray">Configure your health tracker preferences and data</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-mm-blue/20 flex items-center justify-center mr-3">
              <UserIcon className="w-5 h-5 text-mm-blue" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Profile Settings</h2>
              <p className="text-sm text-mm-gray">Your basic health information for calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mm-gray mb-2">
                BMR (Basal Metabolic Rate) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={localProfile.bmr || ''}
                onChange={(e) => updateLocalProfile({ bmr: parseInt(e.target.value) || 0 })}
                className="input-mm w-full"
              />
              <a
                href="/bmr-calculator"
                className="text-xs text-mm-blue hover:text-mm-blue/80 underline mt-1 inline-block"
              >
                Click here to calculate your BMR
              </a>
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={localProfile.gender || ''}
                onChange={(e) => updateLocalProfile({ gender: e.target.value })}
                className="input-mm w-full"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={localProfile.height || ''}
                onChange={(e) => updateLocalProfile({ height: parseFloat(e.target.value) || null })}
                className="input-mm w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={localProfile.weight || ''}
                onChange={(e) => updateLocalProfile({ weight: parseFloat(e.target.value) || null })}
                className="input-mm w-full"
              />
              <p className="text-xs text-mm-gray mt-1">You can update this daily in the tracker</p>
            </div>
          </div>

          {/* Save Button */}
          {profileChanged && (
            <div className="mt-6 p-4 bg-mm-blue/10 border border-mm-blue/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-mm-blue">Unsaved Changes</p>
                  <p className="text-sm text-mm-gray">Your profile has been modified</p>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="btn-mm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timezone Settings */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
              <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Time Zone Settings</h2>
              <p className="text-sm text-mm-gray">Set your local time zone for accurate daily tracking</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-mm-gray mb-2">Your Time Zone</label>
            <select
              value={userTimezone}
              onChange={async (e) => {
                const newTimezone = e.target.value;
                setUserTimezone(newTimezone);
                try {
                  await updateSupabaseProfile({ timezone: newTimezone });
                } catch (error) {
                  console.error('Error saving timezone:', error);
                  alert('Failed to save timezone. Please try again.');
                }
              }}
              className="input-mm w-full"
            >
              <option value="">Select your time zone...</option>
              {timezoneStorage.getCommonTimezones().map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400 font-medium mb-2">Current Time in Your Zone</p>
              <p className="text-xs text-mm-gray">
                {userTimezone && (
                  <>
                    {new Date().toLocaleString('en-US', {
                      timeZone: userTimezone,
                      dateStyle: 'full',
                      timeStyle: 'medium'
                    })}
                  </>
                )}
                {!userTimezone && 'Please select a time zone to see the current time'}
              </p>
              <p className="text-xs text-mm-gray mt-2">
                Days will change at midnight in your selected time zone, ensuring accurate daily tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
              <FireIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Macro Targets</h2>
              <p className="text-sm text-mm-gray">Set your daily nutritional targets for tracking progress</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-mm-gray mb-2">Daily Calorie Target</label>
              <input
                type="number"
                value={localMacroTargets.calories}
                onChange={(e) => updateMacroTarget('calories', e.target.value)}
                className="input-mm w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">Carbs Target (g)</label>
              <input
                type="number"
                value={localMacroTargets.carbs}
                onChange={(e) => updateMacroTarget('carbs', e.target.value)}
                className="input-mm w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">Protein Target (g)</label>
              <input
                type="number"
                value={localMacroTargets.protein}
                onChange={(e) => updateMacroTarget('protein', e.target.value)}
                className="input-mm w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-mm-gray mb-2">Fat Target (g)</label>
              <input
                type="number"
                value={localMacroTargets.fat}
                onChange={(e) => updateMacroTarget('fat', e.target.value)}
                className="input-mm w-full"
              />
            </div>
          </div>

          {/* Save Button */}
          {macroTargetsChanged && (
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-500">Unsaved Changes</p>
                  <p className="text-sm text-mm-gray">Your macro targets have been modified</p>
                </div>
                <button
                  onClick={saveMacroTargets}
                  className="btn-mm py-2 px-4"
                >
                  Save Targets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Injection Compounds */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
              <BeakerIcon className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Injection Compounds</h2>
              <p className="text-sm text-mm-gray">Manage your available injection compounds</p>
            </div>
          </div>

          {/* Current Compounds */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-mm-gray mb-3">Current Compounds</h3>
            <div className="flex flex-wrap gap-2">
              {compounds.map((compound) => (
                <div key={compound.id} className="flex items-center bg-mm-dark2 rounded-full px-4 py-2 border border-mm-gray/20">
                  <span className="text-sm mr-2">{compound.name}</span>
                  <button
                    onClick={() => removeCompound(compound.id, compound.name)}
                    className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                    title="Remove compound"
                  >
                    <XMarkIcon className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Compound */}
          <div>
            <h3 className="text-sm font-semibold text-mm-gray mb-3">Add New Compound</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCompound}
                onChange={(e) => setNewCompound(e.target.value)}
                placeholder="Enter compound name"
                className="input-mm flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addCompound()}
              />
              <button
                onClick={addCompound}
                disabled={!newCompound.trim() || compounds.some(c => c.name === newCompound.trim())}
                className="btn-mm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add
              </button>
            </div>
            <p className="text-xs text-mm-gray mt-2">
              Add compounds you inject to make them available in the tracker
            </p>
          </div>

        </div>

        {/* Injection Targets */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center mr-3">
              <BeakerIcon className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Injection Targets</h2>
              <p className="text-sm text-mm-gray">Set weekly dosage targets for your compounds</p>
            </div>
          </div>

          {/* Current Targets */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-mm-gray mb-3">Current Targets</h3>
            {injectionTargets.length === 0 ? (
              <div className="text-center py-8 text-mm-gray">
                <p>No injection targets set yet</p>
                <p className="text-xs mt-1">Add targets below to track weekly progress</p>
              </div>
            ) : (
              <div className="space-y-3">
                {injectionTargets.map((target) => (
                  <div key={target.id} className="flex items-center justify-between p-4 bg-mm-dark2 rounded-lg border border-mm-gray/20">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-mm-white">{target.compound}</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-teal-500">{target.doseAmount}{target.unit} × {target.frequency}/week</span>
                        <span className="text-mm-gray">= {target.weeklyTarget}{target.unit} weekly</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          target.enabled ? 'bg-green-500/20 text-green-500' : 'bg-mm-gray/20 text-mm-gray'
                        }`}>
                          {target.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingTarget(target)}
                        className="p-2 hover:bg-teal-500/20 rounded-full transition-colors"
                        title="Edit target"
                      >
                        <PlusIcon className="w-4 h-4 text-teal-500" />
                      </button>
                      <button
                        onClick={() => updateInjectionTarget(target.id, { enabled: !target.enabled })}
                        className={`p-2 rounded-full transition-colors ${
                          target.enabled 
                            ? 'hover:bg-red-500/20 text-red-500' 
                            : 'hover:bg-green-500/20 text-green-500'
                        }`}
                        title={target.enabled ? 'Disable target' : 'Enable target'}
                      >
                        {target.enabled ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => removeInjectionTarget(target.id)}
                        className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                        title="Remove target"
                      >
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Target */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mm-gray">Add New Target</h3>
              <button
                onClick={() => {
                  if (editingTarget) {
                    cancelTargetEdit();
                  } else {
                    setShowTargetForm(!showTargetForm);
                  }
                }}
                className="btn-mm py-2 px-4 text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {editingTarget ? 'Cancel Edit' : (showTargetForm ? 'Cancel' : 'Add Target')}
              </button>
            </div>

            {showTargetForm && (
              <div className="p-4 bg-mm-dark2 rounded-lg border border-mm-gray/20">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-mm-gray mb-1">Compound</label>
                    <select
                      value={newTarget.compound}
                      onChange={(e) => setNewTarget({ ...newTarget, compound: e.target.value })}
                      className="input-mm w-full"
                    >
                      <option value="">Select compound</option>
                      {compounds.map((compound) => (
                        <option key={compound.id} value={compound.name}>{compound.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-mm-gray mb-1">Dose Amount</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTarget.doseAmount}
                        onChange={(e) => setNewTarget({ ...newTarget, doseAmount: e.target.value })}
                        className="input-mm w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-mm-gray mb-1">Unit</label>
                      <select
                        value={newTarget.unit}
                        onChange={(e) => setNewTarget({ ...newTarget, unit: e.target.value })}
                        className="input-mm w-full"
                      >
                        <option value="mg">mg</option>
                        <option value="mcg">mcg</option>
                        <option value="ml">ml</option>
                        <option value="IU">IU</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-mm-gray mb-1">Times per Week</label>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={newTarget.frequency}
                        onChange={(e) => setNewTarget({ ...newTarget, frequency: e.target.value })}
                        className="input-mm w-full"
                      />
                    </div>
                  </div>

                  {newTarget.doseAmount && newTarget.frequency && (
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <p className="text-sm text-teal-400 font-medium">Weekly Target Preview</p>
                      <p className="text-xs text-mm-gray">
                        {parseFloat(newTarget.doseAmount || '0')} × {parseInt(newTarget.frequency || '0')} = 
                        <span className="text-teal-500 font-semibold ml-1">
                          {(parseFloat(newTarget.doseAmount || '0') * parseInt(newTarget.frequency || '0')).toFixed(1)}{newTarget.unit} per week
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={editingTarget ? () => {
                        updateInjectionTarget(editingTarget.id, {
                          compound: newTarget.compound,
                          doseAmount: parseFloat(newTarget.doseAmount),
                          unit: newTarget.unit,
                          frequency: parseInt(newTarget.frequency)
                        });
                      } : addInjectionTarget}
                      disabled={!newTarget.compound || !newTarget.doseAmount || !newTarget.frequency}
                      className="btn-mm py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingTarget ? 'Update Target' : 'Save Target'}
                    </button>
                    <button
                      onClick={cancelTargetEdit}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-mm-gray mt-2">
              Set weekly targets to track your injection consistency and dosage accuracy
            </p>
          </div>
        </div>

        {/* Nirvana Session Types */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Nirvana Session Types</h2>
              <p className="text-sm text-mm-gray">Manage available classes for Nirvana Life tracking</p>
            </div>
          </div>

          {/* Session Type List */}
          <div className="space-y-3 mb-6">
            {nirvanaSessionTypes.map((sessionType) => (
              <div key={sessionType.id} className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                <span className="text-mm-white">{sessionType.name}</span>
                <button
                  onClick={() => removeSessionType(sessionType.id)}
                  className="p-1 hover:bg-red-500/20 rounded"
                  title="Remove session type"
                >
                  <XMarkIcon className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Session Type */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newSessionType}
              onChange={(e) => setNewSessionType(e.target.value)}
              placeholder="Add new session type..."
              className="input-mm flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addSessionType()}
            />
            <button
              onClick={addSessionType}
              disabled={!newSessionType.trim()}
              className="btn-mm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-mm-gray mt-4">
            These session types will appear as clickable options on the Nirvana tracking page
          </p>
        </div>

        {/* Winners Bible */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
              <PhotoIcon className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Winners Bible</h2>
              <p className="text-sm text-mm-gray">Upload motivational images for daily inspiration (max 15)</p>
            </div>
          </div>

          {/* Current Images */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mm-gray">
                Current Images ({winnersBibleImages.length}/15)
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                winnersBibleImages.length >= 15
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-green-500/20 text-green-500'
              }`}>
                {winnersBibleImages.length >= 15 ? 'Limit Reached' : `${15 - winnersBibleImages.length} remaining`}
              </span>
            </div>

            {winnersBibleImages.length === 0 ? (
              <div className="text-center py-8 text-mm-gray">
                <PhotoIcon className="w-12 h-12 text-mm-gray/30 mx-auto mb-3" />
                <p>No images uploaded yet</p>
                <p className="text-xs mt-1">Upload images to start building your Winners Bible</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {winnersBibleImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-mm-dark2 border border-mm-gray/20">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeWinnersBibleImage(image.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <XMarkIcon className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                        <p className="text-xs text-white truncate">{image.name}</p>
                        <p className="text-xs text-gray-300">
                          {(image.sizeBytes / 1024 / 1024).toFixed(1)}MB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mm-gray">Upload Images</h3>
              {winnersBibleImages.length > 0 && (
                <a
                  href="/winners-bible"
                  className="text-xs text-yellow-500 hover:text-yellow-400 underline"
                >
                  View Winners Bible
                </a>
              )}
            </div>

            <div className="border-2 border-dashed border-mm-gray/30 rounded-lg p-6 text-center">
              <input
                type="file"
                id="winners-bible-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage || winnersBibleImages.length >= 15}
                className="hidden"
              />
              <label
                htmlFor="winners-bible-upload"
                className={`cursor-pointer inline-flex flex-col items-center ${
                  uploadingImage || winnersBibleImages.length >= 15
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:text-yellow-500'
                }`}
              >
                <PhotoIcon className="w-12 h-12 text-mm-gray/50 mb-3" />
                <span className="text-sm font-medium text-mm-white mb-1">
                  {uploadingImage ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-xs text-mm-gray">
                  {winnersBibleImages.length >= 15
                    ? 'Maximum 15 images reached'
                    : 'PNG, JPG up to 5MB each'}
                </span>
              </label>
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400 font-medium mb-2">Daily Motivation Routine</p>
              <p className="text-xs text-mm-gray">
                Upload images that motivate and inspire you. View them each morning and night
                as part of your daily routine to track on your Daily Tracker.
              </p>
            </div>
          </div>
        </div>

        {/* Food Templates */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
              <FireIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Food Templates</h2>
              <p className="text-sm text-mm-gray">Manage your saved meal templates for quick entry</p>
            </div>
          </div>

          {/* Current Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-mm-gray mb-3">Current Templates</h3>
            {foodTemplates.length === 0 ? (
              <div className="text-center py-8 text-mm-gray">
                <p>No food templates yet</p>
                <p className="text-xs mt-1">Add templates below for quick meal entry</p>
              </div>
            ) : (
              <div className="space-y-3">
                {foodTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-mm-dark2 rounded-lg border border-mm-gray/20">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-orange-500">{template.calories} cal</span>
                        <span className="text-mm-gray">C: {template.carbs}g</span>
                        <span className="text-mm-gray">P: {template.protein}g</span>
                        <span className="text-mm-gray">F: {template.fat}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTemplate(template.id)}
                      className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                      title="Remove template"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Template */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mm-gray">Add New Template</h3>
              <button
                onClick={() => setShowTemplateForm(!showTemplateForm)}
                className="btn-mm py-2 px-4 text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {showTemplateForm ? 'Cancel' : 'Add Template'}
              </button>
            </div>

            {showTemplateForm && (
              <div className="p-4 bg-mm-dark2 rounded-lg border border-mm-gray/20">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Template name (e.g., Breakfast Bowl)"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="input-mm w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Calories"
                      value={newTemplate.calories}
                      onChange={(e) => setNewTemplate({ ...newTemplate, calories: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={newTemplate.carbs}
                      onChange={(e) => setNewTemplate({ ...newTemplate, carbs: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={newTemplate.protein}
                      onChange={(e) => setNewTemplate({ ...newTemplate, protein: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={newTemplate.fat}
                      onChange={(e) => setNewTemplate({ ...newTemplate, fat: e.target.value })}
                      className="input-mm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addTemplate}
                      disabled={!newTemplate.name.trim() || !newTemplate.calories.trim()}
                      className="btn-mm py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Template
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateForm(false);
                        setNewTemplate({ name: '', calories: '', carbs: '', protein: '', fat: '' });
                      }}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-mm-gray mt-2">
              Create meal templates with predefined nutritional values for quick entry on the calories page
            </p>
          </div>

        </div>

        {/* Daily Tracker Settings */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
              <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Daily Tracker Settings</h2>
              <p className="text-sm text-mm-gray">Configure which metrics to track daily</p>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-mm-gray mb-3">Core Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                <div>
                  <p className="font-medium">Weight Tracking</p>
                  <p className="text-xs text-mm-gray">Daily weight entry with BMI calculation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyTrackerSettings.enableWeight}
                    onChange={(e) => updateDailyTrackerSetting('enableWeight', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mm-blue"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                <div>
                  <p className="font-medium">Deep Work Sessions</p>
                  <p className="text-xs text-mm-gray">Track focused work completion</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyTrackerSettings.enableDeepWork}
                    onChange={(e) => updateDailyTrackerSetting('enableDeepWork', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mm-blue"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Metrics */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-mm-gray">Custom Metrics</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyTrackerSettings.enableCustomMetrics}
                  onChange={(e) => updateDailyTrackerSetting('enableCustomMetrics', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mm-blue"></div>
              </label>
            </div>

            {dailyTrackerSettings.enableCustomMetrics && (
              <div className="space-y-3">
                {dailyTrackerSettings.customMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-xs text-mm-gray">
                        {metric.type === 'number' && `Track ${metric.unit}`}
                        {metric.type === 'scale' && `Rate 1-${metric.max} scale`}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metric.enabled}
                        onChange={() => toggleCustomMetric(metric.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mm-blue"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {!dailyTrackerSettings.enableCustomMetrics && (
              <div className="text-center py-6 text-mm-gray">
                <p>Enable custom metrics to configure additional tracking options</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm text-purple-400 font-medium mb-2">Daily Tracker Integration</p>
            <p className="text-xs text-mm-gray">
              These settings control which metrics appear on your Daily Tracker page. 
              You can always track calories, exercise, and injections from their dedicated pages.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
              <DocumentArrowDownIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading">Data Management</h2>
              <p className="text-sm text-mm-gray">Export, backup, or reset your data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-mm-dark2 rounded-lg">
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-mm-gray">Download your complete health data as JSON</p>
              </div>
              <button
                onClick={exportData}
                className="btn-mm py-2 px-4"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-mm-dark2 rounded-lg">
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-mm-gray">Restore data from a JSON backup file</p>
              </div>
              <button
                onClick={() => alert('Data Import is temporarily disabled during the Supabase migration. This feature will be re-enabled soon with enhanced cloud restore capabilities.')}
                className="btn-mm py-2 px-4 cursor-pointer"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Import
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div>
                <p className="font-medium text-red-400">Clear All Data</p>
                <p className="text-sm text-red-300">Permanently delete all tracked data</p>
              </div>
              <button
                onClick={() => setShowDataClearWarning(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card-mm p-6">
          <div className="flex items-center mb-6">
            <div className="gradient-icon gradient-activities w-10 h-10 mr-3">
              <HeartIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-heading">About MM Health Tracker</h2>
              <p className="text-sm text-mm-gray">Version and information</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-mm-gray">Version</span>
              <span>1.0.0 (Phase 0.2)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mm-gray">Build</span>
              <span>2025.01.17</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mm-gray">Storage</span>
              <span>Local Browser Storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Compound Warning Modal */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mm-dark border border-mm-gray/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-heading">Delete Compound</h3>
            </div>
            <p className="text-mm-gray mb-6">
              Are you sure you want to delete <strong>{showDeleteWarning}</strong>? 
              This compound has injection data associated with it. Deleting it may affect your historical records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => confirmDeleteCompound(showDeleteWarning)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteWarning(null)}
                className="btn-secondary px-4 py-2 rounded-lg flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Warning Modal */}
      {showDataClearWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mm-dark border border-red-500/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-heading text-red-400">Clear All Data</h3>
            </div>
            <p className="text-mm-gray mb-6">
              This will permanently delete ALL your health tracking data including:
              <br />• All injection records
              <br />• All calorie and exercise entries  
              <br />• Profile information
              <br />• All historical data
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-6">
              <p className="text-red-300 text-sm font-medium">
                ⚠️ This action cannot be undone!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearAllData}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1"
              >
                Yes, Clear Everything
              </button>
              <button
                onClick={() => setShowDataClearWarning(false)}
                className="btn-secondary px-4 py-2 rounded-lg flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Section */}
      <div className="card-mm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-heading">Account</h2>
            <p className="text-sm text-mm-gray">Sign out of your account</p>
          </div>
        </div>

        <button
          onClick={() => signOut(() => router.push('/'))}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center min-h-screen"><p className="text-mm-gray">Loading settings...</p></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}