'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { profileStorage, dailyEntryStorage, generateId, weeklyEntryStorage, getWeekStartDate, getDayOfWeek, timezoneStorage, winnersBibleStorage, nirvanaSessionStorage } from '@/lib/storage';
import { DailyEntry, UserProfile, MITEntry, WeeklyEntry, WeeklyObjective } from '@/types';
import { formatDateLong } from '@/lib/dateUtils';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ScaleIcon,
  BriefcaseIcon,
  PlusIcon,
  FireIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  XMarkIcon,
  AcademicCapIcon,
  PhotoIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

export default function DailyTrackerPage() {
  const [currentDate, setCurrentDate] = useState(timezoneStorage.getCurrentDate());
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [macroTargets, setMacroTargets] = useState({
    calories: '',
    carbs: '',
    protein: '',
    fat: ''
  });
  const [showMITForm, setShowMITForm] = useState(false);
  const [mitInput, setMitInput] = useState('');
  const [tomorrowMITs, setTomorrowMITs] = useState<MITEntry[]>([]);
  const [todayMITs, setTodayMITs] = useState<MITEntry[]>([]);
  
  // Weekly objectives state
  const [weeklyEntry, setWeeklyEntry] = useState<WeeklyEntry | null>(null);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [objectiveInputs, setObjectiveInputs] = useState(['', '', '']);
  const [whyInput, setWhyInput] = useState('');
  const [reviewInput, setReviewInput] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Day of week helpers
  const dayOfWeek = getDayOfWeek(currentDate); // 0=Sunday, 1=Monday, etc.
  const isMonday = dayOfWeek === 1;
  const isTuesdayToThursday = dayOfWeek >= 2 && dayOfWeek <= 4;
  const isFriday = dayOfWeek === 5;
  const weekStartDate = getWeekStartDate(currentDate);

  useEffect(() => {
    const existingProfile = profileStorage.get();
    setProfile(existingProfile);
    
    loadDayData(currentDate);

    // Load macro targets from storage
    const storedMacroTargets = localStorage.getItem('mm-macro-targets');
    if (storedMacroTargets) {
      const parsed = JSON.parse(storedMacroTargets);
      setMacroTargets(parsed);
    }

    // Load today's MITs (from the current day)
    const todayEntry = dailyEntryStorage.getByDate(currentDate);
    if (todayEntry?.mits) {
      setTodayMITs(todayEntry.mits);
    } else {
      setTodayMITs([]);
    }

    // Load tomorrow's MITs for planning
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    const tomorrowEntry = dailyEntryStorage.getByDate(tomorrowDateString);
    if (tomorrowEntry?.mits) {
      setTomorrowMITs(tomorrowEntry.mits);
    } else {
      setTomorrowMITs([]);
    }

    // Load weekly objectives
    const currentWeekEntry = weeklyEntryStorage.getByDate(currentDate);
    setWeeklyEntry(currentWeekEntry);
    
    if (currentWeekEntry) {
      setWhyInput(currentWeekEntry.whyImportant || '');
      setReviewInput(currentWeekEntry.fridayReview || '');
      setShowReviewForm(!currentWeekEntry.fridayReview); // Show form if no review exists
      
      // Set objective inputs for Monday form
      const objInputs = ['', '', ''];
      currentWeekEntry.objectives.forEach((obj, index) => {
        if (index < 3) objInputs[index] = obj.objective;
      });
      setObjectiveInputs(objInputs);
    } else {
      setWhyInput('');
      setReviewInput('');
      setShowReviewForm(true); // Show form if no weekly entry exists
      setObjectiveInputs(['', '', '']);
    }
  }, [currentDate]);

  // Reload data when page becomes visible (e.g., returning from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDayData(currentDate);
      }
    };

    const handleFocus = () => {
      loadDayData(currentDate);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentDate]);

  const loadDayData = (date: string) => {
    const entry = dailyEntryStorage.getByDate(date);
    setDailyEntry(entry);
    
    // Pre-populate weight input if weight exists for this day
    if (entry?.weight) {
      setWeightInput(entry.weight.toString());
    } else {
      setWeightInput('');
    }

    // Also reload MITs to ensure they're in sync
    const todayEntry = dailyEntryStorage.getByDate(date);
    if (todayEntry?.mits) {
      setTodayMITs(todayEntry.mits);
    } else {
      setTodayMITs([]);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const updateWeight = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      // Update daily entry
      const updatedEntry = dailyEntryStorage.updateWeight(currentDate, weight);
      setDailyEntry(updatedEntry);
      
      // Also update the profile weight if this is today's weight
      const todayDate = timezoneStorage.getCurrentDate();
      if (currentDate === todayDate && profile) {
        const updatedProfile = profileStorage.update({ weight });
        setProfile(updatedProfile); // Update local profile state
      }
      
      setShowWeightForm(false);
    }
  };

  const toggleDeepWork = () => {
    const updatedEntry = dailyEntryStorage.toggleDeepWork(currentDate);
    setDailyEntry(updatedEntry);
  };

  const handleWinnersBibleView = () => {
    // Navigate to Winners Bible page without marking anything complete
    window.location.href = '/winners-bible';
  };

  const addMIT = () => {
    if (mitInput.trim()) {
      const newMIT: MITEntry = {
        id: generateId(),
        task: mitInput.trim(),
        completed: false,
        order: tomorrowMITs.length
      };
      const updatedMITs = [...tomorrowMITs, newMIT];
      setTomorrowMITs(updatedMITs);
      
      // Save to tomorrow's entry
      const tomorrow = new Date(currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0];
      dailyEntryStorage.updateMITs(tomorrowDateString, updatedMITs);
      
      setMitInput('');
    }
  };

  const removeMIT = (mitId: string) => {
    const updatedMITs = tomorrowMITs.filter(mit => mit.id !== mitId);
    setTomorrowMITs(updatedMITs);
    
    // Save to tomorrow's entry
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    dailyEntryStorage.updateMITs(tomorrowDateString, updatedMITs);
  };

  const toggleTodayMIT = (mitId: string) => {
    const updatedMITs = todayMITs.map(mit => 
      mit.id === mitId ? { ...mit, completed: !mit.completed } : mit
    );
    setTodayMITs(updatedMITs);
    dailyEntryStorage.updateMITs(currentDate, updatedMITs);
  };

  // Weekly objectives functions
  const saveWeeklyObjectives = () => {
    const objectives: WeeklyObjective[] = objectiveInputs
      .filter(input => input.trim())
      .map((objective, index) => ({
        id: generateId(),
        objective: objective.trim(),
        completed: false,
        order: index
      }));

    const updatedEntry = weeklyEntryStorage.createOrUpdate(weekStartDate, {
      objectives,
      whyImportant: whyInput.trim()
    });
    
    setWeeklyEntry(updatedEntry);
    setShowWeeklyForm(false);
  };

  const updateObjectiveInput = (index: number, value: string) => {
    const newInputs = [...objectiveInputs];
    newInputs[index] = value;
    setObjectiveInputs(newInputs);
  };

  const toggleWeeklyObjective = (objectiveId: string) => {
    if (!weeklyEntry) return;
    
    const updatedEntry = weeklyEntryStorage.toggleObjectiveCompletion(weekStartDate, objectiveId);
    setWeeklyEntry(updatedEntry);
  };

  const saveFridayReview = () => {
    if (!weeklyEntry) return;
    
    const updatedEntry = weeklyEntryStorage.updateFridayReview(weekStartDate, reviewInput.trim());
    setWeeklyEntry(updatedEntry);
    setShowReviewForm(false); // Close the form after saving
  };

  const isToday = timezoneStorage.isToday(currentDate);
  
  const metrics = useMemo(() => {
    // Default BMR if no profile
    const bmr = profile?.bmr || 2000;

    if (!dailyEntry) {
      return {
        totalCaloriesConsumed: 0,
        totalCaloriesBurned: 0,
        calorieBalance: bmr,
        macros: { carbs: 0, protein: 0, fat: 0 },
        completionStatus: {
          calories: false,
          exercise: false,
          weight: false,
          deepWork: false,
          mits: false,
          winnersBible: false,
          injections: false,
          nirvana: false
        }
      };
    }

    const totalCaloriesConsumed = dailyEntry.calories.reduce((sum, cal) => sum + cal.calories, 0);
    const totalCaloriesBurned = dailyEntry.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    const calorieBalance = bmr - totalCaloriesConsumed + totalCaloriesBurned;

    const macros = dailyEntry.calories.reduce(
      (totals, cal) => ({
        carbs: totals.carbs + cal.carbs,
        protein: totals.protein + cal.protein,
        fat: totals.fat + cal.fat
      }),
      { carbs: 0, protein: 0, fat: 0 }
    );

    // Get tomorrow's MITs for completion status
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if injections were logged for current date (from dailyEntry)
    const hasInjections = dailyEntry.injections.length > 0;

    // Check if nirvana sessions were logged for current date
    const nirvanaEntry = nirvanaSessionStorage.getByDate(currentDate);
    const hasNirvanaSessions = nirvanaEntry && nirvanaEntry.sessions.length > 0;

    const completionStatus = {
      calories: dailyEntry.calories.length > 0,
      exercise: dailyEntry.exercises.length > 0,
      weight: dailyEntry.weight !== undefined,
      deepWork: dailyEntry.deepWorkCompleted || false,
      mits: tomorrowMITs.length > 0,
      winnersBible: (dailyEntry.winnersBibleMorning || false) || (dailyEntry.winnersBibleNight || false),
      injections: hasInjections,
      nirvana: hasNirvanaSessions
    };

    return {
      totalCaloriesConsumed,
      totalCaloriesBurned,
      calorieBalance,
      macros,
      completionStatus
    };
  }, [currentDate, profile, dailyEntry, tomorrowMITs]);

  const completedCount = Object.values(metrics.completionStatus).filter(Boolean).length;
  const totalMetrics = Object.keys(metrics.completionStatus).length;
  const completionPercentage = Math.round((completedCount / totalMetrics) * 100);

  // Macro targets as numbers for comparison
  const targets = {
    calories: parseInt(macroTargets.calories) || 0,
    carbs: parseInt(macroTargets.carbs) || 0,
    protein: parseInt(macroTargets.protein) || 0,
    fat: parseInt(macroTargets.fat) || 0
  };

  const hasTargets = targets.calories > 0 || targets.carbs > 0 || targets.protein > 0 || targets.fat > 0;

  return (
    <div className="p-6 md:p-8 w-[90%] mx-auto">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading mb-2">Daily Tracker</h1>
          <p className="text-mm-gray">Track your daily health metrics and goals</p>
        </div>

        <div className="flex items-center gap-6 bg-mm-dark2 rounded-lg px-6 py-4 border border-mm-gray/20">
          <button
            onClick={() => navigateDay('prev')}
            className="p-3 hover:bg-mm-gray/10 rounded-lg transition-colors"
            title="Previous day"
          >
            <ChevronLeftIcon className="w-8 h-8 text-mm-gray" />
          </button>
          
          <div className="text-center min-w-[200px]">
            <div className="text-3xl font-heading text-mm-white">
              {formatDateLong(new Date(currentDate + 'T12:00:00'))}
            </div>
            {isToday && (
              <div className="text-sm text-mm-blue mt-1">Today</div>
            )}
          </div>

          <button
            onClick={() => navigateDay('next')}
            className="p-3 hover:bg-mm-gray/10 rounded-lg transition-colors"
            title="Next day"
            disabled={isToday}
          >
            <ChevronRightIcon className={`w-8 h-8 ${isToday ? 'text-mm-gray/50' : 'text-mm-gray'}`} />
          </button>
        </div>
      </div>

      {/* Two-column layout for Weekly Planning/Review + Today's MITs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Weekly Planning (Monday) or Review (Friday) */}
        {isMonday && (
          <div className="card-mm p-6 bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Plan This Week&apos;s Objectives</h2>
              <p className="text-sm text-mm-gray">Monday Planning - Set your 3 key objectives for the week</p>
            </div>
          </div>

          {!showWeeklyForm && !weeklyEntry?.objectives.length ? (
            <button
              onClick={() => setShowWeeklyForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full w-full py-3 text-base mb-4 transition-colors flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Set Weekly Objectives
            </button>
          ) : !showWeeklyForm ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                {weeklyEntry?.objectives.map((objective, index) => (
                  <div key={objective.id} className="flex items-center gap-3 p-3 bg-mm-dark2/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-mm-white">{objective.objective}</span>
                  </div>
                ))}
              </div>
              
              {weeklyEntry?.whyImportant && (
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="text-sm font-heading text-green-400 mb-2">Why this matters:</h4>
                  <p className="text-sm text-mm-white">{weeklyEntry.whyImportant}</p>
                </div>
              )}
              
              <button
                onClick={() => setShowWeeklyForm(true)}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold rounded-full py-2 px-4 text-sm transition-colors"
              >
                Edit Objectives
              </button>
            </div>
          ) : null}

          {showWeeklyForm && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-heading text-mm-gray mb-3">Weekly Objectives (3 max)</h3>
                {objectiveInputs.map((input, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <label className="text-xs text-mm-gray">Objective {index + 1}</label>
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => updateObjectiveInput(index, e.target.value)}
                      placeholder={`Enter objective ${index + 1}...`}
                      className="input-mm w-full"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-heading text-mm-gray mb-2">Why is this important?</label>
                <textarea
                  value={whyInput}
                  onChange={(e) => setWhyInput(e.target.value)}
                  placeholder="Explain why these objectives matter and what impact they&apos;ll have..."
                  className="input-mm w-full h-24 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveWeeklyObjectives}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-full flex-1 py-3 transition-colors"
                  disabled={!objectiveInputs.some(input => input.trim())}
                >
                  Save Objectives
                </button>
                <button
                  onClick={() => setShowWeeklyForm(false)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold rounded-full px-6 py-3 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Friday Review in Left Column */}
        {isFriday && weeklyEntry?.objectives && weeklyEntry.objectives.length > 0 && (
          <div className="card-mm p-6 bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Weekly Objectives Review</h2>
              <p className="text-sm text-mm-gray">Friday Review - How did you do this week?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-heading text-mm-gray mb-3">Mark completed objectives:</h3>
              {weeklyEntry.objectives.map((objective, index) => (
                <div key={objective.id} className="flex items-center gap-3 p-3 bg-mm-dark2/50 rounded-lg mb-2">
                  <button
                    onClick={() => toggleWeeklyObjective(objective.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      objective.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-green-500 hover:bg-green-500/20'
                    }`}
                  >
                    {objective.completed && (
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className={`flex-1 text-mm-white ${objective.completed ? 'line-through opacity-50' : ''}`}>
                    {objective.objective}
                  </span>
                </div>
              ))}
            </div>

            {showReviewForm ? (
              <div>
                <div>
                  <label className="block text-sm font-heading text-mm-gray mb-2">Weekly Review & Reflection</label>
                  <textarea
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="How did the week go? What worked well? What could be improved? Any lessons learned?"
                    className="input-mm w-full h-32 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={saveFridayReview}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-full flex-1 py-3 transition-colors"
                    disabled={!reviewInput.trim()}
                  >
                    Save Weekly Review
                  </button>
                  {weeklyEntry.fridayReview && (
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold rounded-full px-6 py-3 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {weeklyEntry.fridayReview && !showReviewForm && (
              <div className="bg-green-500/10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-heading text-green-400">Weekly Review:</h4>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-semibold rounded-full px-3 py-1 text-xs transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-mm-white">{weeklyEntry.fridayReview}</p>
              </div>
            )}
          </div>
          </div>
        )}

        {/* Right Column: Today's MITs - positioned right on Mon/Fri, left on other days */}
        <div className={`${(isMonday || isFriday) ? 'lg:order-2' : 'lg:order-1'}`}>
          {todayMITs.length > 0 && (
            <div className="card-mm p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Today&apos;s Most Important Tasks</h2>
              <p className="text-sm text-mm-gray">Focus on what matters most</p>
            </div>
          </div>
          <div className="space-y-2">
            {todayMITs.map((mit) => (
              <div key={mit.id} className="flex items-center gap-3 p-3 bg-mm-dark2/50 rounded-lg">
                <button
                  onClick={() => toggleTodayMIT(mit.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    mit.completed
                      ? 'bg-yellow-500 border-yellow-500' // Yellow when completed
                      : 'border-yellow-500 hover:bg-yellow-500/20'
                  }`}
                >
                  {mit.completed && (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </button>
                <span className={`flex-1 text-mm-white ${mit.completed ? 'line-through opacity-50' : ''}`}>
                  {mit.task}
                </span>
              </div>
            ))}
          </div>
            <div className="mt-3 text-sm text-mm-gray">
              {todayMITs.filter(m => m.completed).length} of {todayMITs.length} completed
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Completion Overview - Combined Card */}
      <div className="card-mm p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Progress Column */}
          <div className="bg-gradient-to-br from-mm-blue/20 to-mm-blue/10 border border-mm-blue/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mm-blue/20 flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-mm-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-heading text-mm-white">Daily Progress</h3>
                  <p className="text-sm text-mm-gray">Overall completion</p>
                </div>
              </div>
              <div className="text-2xl font-heading text-mm-blue">
                {completionPercentage}%
              </div>
            </div>
            
            <div className="bg-mm-gray/20 rounded-full h-2 mb-2">
              <div 
                className="bg-mm-blue rounded-full h-2 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-mm-gray">
              {completedCount} of {totalMetrics} metrics completed
            </p>
          </div>

          {/* Today's Summary Column */}
          <div>
            <h3 className="text-lg font-heading mb-4 text-mm-white">Today&apos;s Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-mm-gray">Calories consumed</span>
                <span className="text-mm-white">{metrics.totalCaloriesConsumed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mm-gray">Exercise burned</span>
                <span className="text-mm-white">{metrics.totalCaloriesBurned}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-mm-gray/20 pt-3">
                <span className="text-mm-gray">Calorie balance</span>
                <span className={`font-semibold ${metrics.calorieBalance >= 0 ? 'text-mm-white' : 'text-red-500'}`}>
                  {Math.abs(metrics.calorieBalance)} {metrics.calorieBalance >= 0 ? 'deficit' : 'surplus'}
                </span>
              </div>
            </div>
          </div>

          {/* Macros Progress Column */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-heading text-mm-white">Macros Progress</h3>
              <p className="text-sm text-mm-gray">Today vs targets</p>
            </div>
            
            {hasTargets ? (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-mm-gray pb-2">Metric</th>
                    <th className="text-right text-xs text-mm-gray pb-2">Current</th>
                    <th className="text-right text-xs text-mm-gray pb-2">Target</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {targets.calories > 0 && (
                    <tr>
                      <td className="py-1 text-mm-white">Calories</td>
                      <td className={`py-1 text-right font-semibold ${
                        metrics.totalCaloriesConsumed <= targets.calories ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {metrics.totalCaloriesConsumed}
                      </td>
                      <td className="py-1 text-right text-mm-gray">{targets.calories}</td>
                    </tr>
                  )}
                  {targets.carbs > 0 && (
                    <tr>
                      <td className="py-1 text-mm-white">Carbs</td>
                      <td className={`py-1 text-right font-semibold ${
                        metrics.macros.carbs <= targets.carbs ? 'text-mm-white' : 'text-red-500'
                      }`}>
                        {Math.round(metrics.macros.carbs)}g
                      </td>
                      <td className="py-1 text-right text-mm-gray">{targets.carbs}g</td>
                    </tr>
                  )}
                  {targets.protein > 0 && (
                    <tr>
                      <td className="py-1 text-mm-white">Protein</td>
                      <td className={`py-1 text-right font-semibold ${
                        metrics.macros.protein <= targets.protein ? 'text-mm-white' : 'text-red-500'
                      }`}>
                        {Math.round(metrics.macros.protein)}g
                      </td>
                      <td className="py-1 text-right text-mm-gray">{targets.protein}g</td>
                    </tr>
                  )}
                  {targets.fat > 0 && (
                    <tr>
                      <td className="py-1 text-mm-white">Fat</td>
                      <td className={`py-1 text-right font-semibold ${
                        metrics.macros.fat <= targets.fat ? 'text-mm-white' : 'text-red-500'
                      }`}>
                        {Math.round(metrics.macros.fat)}g
                      </td>
                      <td className="py-1 text-right text-mm-gray">{targets.fat}g</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-heading text-orange-500 mb-1">⚡</div>
                <p className="text-xs text-mm-gray">Set targets in Settings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Metrics Grid - Now with 8 metrics in 4x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {/* Weight Tracking */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Weight</h3>
              <p className="text-xs text-mm-gray">Daily weigh-in</p>
            </div>
            {metrics.completionStatus.weight ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="btn-mm w-full py-2 text-sm mb-3"
          >
            {dailyEntry?.weight ? 'Update Weight' : (
              <>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Weight
              </>
            )}
          </button>

          {dailyEntry?.weight && (
            <div className="text-center">
              <div className="text-2xl font-heading text-mm-white">
                {dailyEntry.weight}kg
              </div>
            </div>
          )}

          {showWeightForm && (
            <div className="mt-3 p-3 bg-mm-dark2 rounded-lg">
              <div className="relative mb-2">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="input-mm w-full text-sm pr-10"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mm-gray text-sm">
                  kg
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={updateWeight}
                  className="btn-mm py-2 w-full text-sm"
                  disabled={!weightInput || isNaN(parseFloat(weightInput))}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowWeightForm(false)}
                  className="btn-secondary py-2 w-full text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deep Work */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Deep Work</h3>
              <p className="text-xs text-mm-gray">Focus session</p>
            </div>
            {metrics.completionStatus.deepWork ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <button
            onClick={toggleDeepWork}
            className={`btn-mm w-full py-2 text-sm mb-3 ${
              metrics.completionStatus.deepWork ? 'bg-green-500 hover:bg-green-600' : ''
            }`}
          >
            {metrics.completionStatus.deepWork ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.completionStatus.deepWork ? '✓' : '○'}
            </div>
          </div>
        </div>

        {/* Food */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Food</h3>
              <p className="text-xs text-mm-gray">Calorie tracking</p>
            </div>
            {metrics.completionStatus.calories ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <a href="/calories" className="btn-secondary w-full py-2 text-sm mb-3 block text-center">
            Track Food
          </a>
          
          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.totalCaloriesConsumed} cal
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Exercise</h3>
              <p className="text-xs text-mm-gray">Workout tracking</p>
            </div>
            {metrics.completionStatus.exercise ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <a href="/calories" className="btn-secondary w-full py-2 text-sm mb-3 block text-center">
            Track Exercise
          </a>
          
          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.totalCaloriesBurned} cal
            </div>
          </div>
        </div>

        {/* MITs Planning */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">MITs</h3>
              <p className="text-xs text-mm-gray">Tomorrow&apos;s plan</p>
            </div>
            {metrics.completionStatus.mits ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <button
            onClick={() => {
              const mitSection = document.querySelector('[data-mit-section]');
              mitSection?.scrollIntoView({ behavior: 'smooth' });
              setShowMITForm(true);
            }}
            className={`btn-mm w-full py-2 text-sm mb-3 ${
              metrics.completionStatus.mits ? 'bg-green-500 hover:bg-green-600' : ''
            }`}
          >
            {metrics.completionStatus.mits ? 'Update MITs' : 'Plan MITs'}
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.completionStatus.mits ? '✓' : tomorrowMITs.length || '○'}
            </div>
          </div>
        </div>

        {/* Winners Bible */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Winners Bible</h3>
              <p className="text-xs text-mm-gray">Daily inspiration</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Morning indicator */}
              <div className="flex items-center">
                <SunIcon className="w-4 h-4 text-yellow-500 mr-1" />
                {dailyEntry?.winnersBibleMorning ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-mm-gray/50" />
                )}
              </div>
              {/* Evening indicator */}
              <div className="flex items-center">
                <MoonIcon className="w-4 h-4 text-blue-500 mr-1" />
                {dailyEntry?.winnersBibleNight ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-mm-gray/50" />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleWinnersBibleView}
            className="btn-mm w-full py-2 text-sm mb-3"
          >
            View
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center">
                <SunIcon className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="text-lg font-heading text-mm-white">
                  {dailyEntry?.winnersBibleMorning ? '✓' : '○'}
                </span>
              </div>
              <div className="flex items-center">
                <MoonIcon className="w-5 h-5 text-blue-500 mr-1" />
                <span className="text-lg font-heading text-mm-white">
                  {dailyEntry?.winnersBibleNight ? '✓' : '○'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Injections Tracking */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Injections</h3>
              <p className="text-xs text-mm-gray">Daily compounds</p>
            </div>
            {metrics.completionStatus.injections ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <a href="/injections" className="btn-secondary w-full py-2 text-sm mb-3 block text-center">
            Track Injections
          </a>

          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.completionStatus.injections ? '✓' : '○'}
            </div>
          </div>
        </div>

        {/* Nirvana Sessions */}
        <div className="card-mm p-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-mm-white">Nirvana</h3>
              <p className="text-xs text-mm-gray">Training sessions</p>
            </div>
            {metrics.completionStatus.nirvana ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-mm-gray/50" />
            )}
          </div>

          <a href="/nirvana" className="btn-secondary w-full py-2 text-sm mb-3 block text-center">
            Track Sessions
          </a>

          <div className="text-center">
            <div className="text-2xl font-heading text-mm-white">
              {metrics.completionStatus.nirvana ? '✓' : '○'}
            </div>
          </div>
        </div>
      </div>


      {/* Two-column layout for Weekly Objectives and Tomorrow's MITs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tuesday-Thursday: Display Weekly Objectives */}
        {isTuesdayToThursday && weeklyEntry?.objectives && weeklyEntry.objectives.length > 0 ? (
          <div className="card-mm p-4 bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <AcademicCapIcon className="w-4 h-4 text-green-500" />
              </div>
              <h3 className="font-heading text-mm-white">This Week&apos;s Objectives</h3>
            </div>

            <div className="grid gap-2 mb-3">
              {weeklyEntry.objectives.map((objective, index) => (
                <div key={objective.id} className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="text-mm-white">{objective.objective}</span>
                </div>
              ))}
            </div>

            {weeklyEntry.whyImportant && (
              <div className="bg-green-500/10 rounded p-3">
                <p className="text-xs text-green-300 italic">{weeklyEntry.whyImportant}</p>
              </div>
            )}
          </div>
        ) : (
          <div></div>
        )}

        {/* Tomorrow's MIT Planning Card */}
      <div data-mit-section className="card-mm p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Plan Tomorrow&apos;s MITs</h2>
              <p className="text-sm text-mm-gray">Complete before bed - Set tomorrow&apos;s priorities</p>
            </div>
          </div>
          {metrics.completionStatus.mits ? (
            <CheckCircleIconSolid className="w-8 h-8 text-green-500" />
          ) : (
            <CheckCircleIcon className="w-8 h-8 text-mm-gray/50" />
          )}
        </div>

        <button
          onClick={() => setShowMITForm(!showMITForm)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full w-full py-3 text-base mb-4 transition-colors flex items-center justify-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add tomorrow&apos;s MITs
        </button>

        {showMITForm && (
          <div className="mb-4 p-4 bg-mm-dark2 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={mitInput}
                onChange={(e) => setMitInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMIT()}
                placeholder="Enter a most important task for tomorrow..."
                className="flex-1 px-4 py-2 bg-mm-dark text-mm-white rounded-lg border border-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.2)] focus:outline-none transition-all"
                autoFocus
              />
              <button
                onClick={addMIT}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full transition-colors"
                disabled={!mitInput.trim()}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowMITForm(false);
                  setMitInput('');
                }}
                className="btn-secondary px-4"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {tomorrowMITs.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-heading text-mm-gray mb-2">Tomorrow&apos;s Tasks ({tomorrowMITs.length})</h3>
            {tomorrowMITs.map((mit, index) => (
              <div key={mit.id} className="flex items-center gap-3 p-3 bg-mm-dark2/50 rounded-lg group">
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="flex-1 text-mm-white">{mit.task}</span>
                <button
                  onClick={() => removeMIT(mit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="w-12 h-12 text-mm-gray/30 mx-auto mb-3" />
            <p className="text-mm-gray">No tasks planned for tomorrow yet</p>
            <p className="text-sm text-mm-gray/70 mt-1">Add 3-5 most important tasks to focus on</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-sm text-yellow-300">
            💡 <strong>Tip:</strong> Plan 3-5 MITs each night. These should be your highest priority work tasks that move the needle forward.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
