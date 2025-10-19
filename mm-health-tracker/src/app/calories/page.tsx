'use client';

import React, { useState, useEffect } from 'react';
import { timezoneStorage } from '@/lib/storage';
import { useMacroTargets, useFoodTemplates } from '@/lib/hooks/useSettings';
import { useDaily, useDailyRange } from '@/lib/hooks/useDaily';
import { useProfile } from '@/lib/context-supabase';
import { formatDateForDisplay, formatDateLong } from '@/lib/dateUtils';
import { PlusIcon, XMarkIcon, RectangleStackIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Database } from '@/lib/supabase/database.types';

type FoodTemplate = Database['public']['Tables']['food_templates']['Row'];

export default function CaloriesPage() {
  const [currentDate, setCurrentDate] = useState(timezoneStorage.getCurrentDate());
  const { profile } = useProfile();
  const bmr = profile?.bmr || 2000;

  // Load today's data from Supabase
  const {
    calories: todayCalories,
    exercises: todayExercises,
    addCalorieEntry: addCalorieToSupabase,
    removeCalorieEntry: removeCalorieFromSupabase,
    addExerciseEntry: addExerciseToSupabase,
    removeExerciseEntry: removeExerciseFromSupabase,
  } = useDaily(currentDate);

  // Load food templates from Supabase
  const { templates: foodTemplates } = useFoodTemplates();

  // Load macro targets from Supabase
  const { macroTargets } = useMacroTargets();

  // Load historical data for the 30-day chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const {
    calories: historicalCalories,
    exercises: historicalExercises
  } = useDailyRange(thirtyDaysAgo.toISOString().split('T')[0], currentDate);

  const [calorieInput, setCalorieInput] = useState({
    name: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: ''
  });
  const [exerciseInput, setExerciseInput] = useState({
    type: '',
    duration: '',
    caloriesBurned: ''
  });
  const [showCalorieForm, setShowCalorieForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FoodTemplate | null>(null);
  const [templateQuantity, setTemplateQuantity] = useState('1');

  const isToday = timezoneStorage.isToday(currentDate);

  // Calculate history data from Supabase
  const historyData = React.useMemo(() => {
    if (!historicalCalories.length && !historicalExercises.length) return [];

    const history: Array<{
      date: string;
      foodConsumed: number;
      exerciseBurnt: number;
      calorieBalance: number;
      proteinEaten: number;
      proteinGoalMet: boolean;
      fatEaten: number;
      fatGoalMet: boolean;
    }> = [];
    const dates = new Set<string>();

    // Collect all unique dates from the last 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.add(date.toISOString().split('T')[0]);
    }

    // Calculate metrics for each date
    dates.forEach(dateStr => {
      const dayCalories = historicalCalories.filter(c => c.date === dateStr);
      const dayExercises = historicalExercises.filter(e => e.date === dateStr);

      const foodConsumed = dayCalories.reduce((sum, c) => sum + (Number(c.calories) || 0), 0);
      const exerciseBurnt = dayExercises.reduce((sum, e) => sum + (Number(e.calories_burned) || 0), 0);
      const calorieBalance = bmr - foodConsumed + exerciseBurnt;

      const proteinEaten = Math.round(dayCalories.reduce((sum, c) => sum + (Number(c.protein) || 0), 0));
      const fatEaten = Math.round(dayCalories.reduce((sum, c) => sum + (Number(c.fat) || 0), 0));

      const proteinTarget = parseInt(macroTargets.protein) || 0;
      const fatTarget = parseInt(macroTargets.fat) || 0;

      history.push({
        date: dateStr,
        foodConsumed,
        exerciseBurnt,
        calorieBalance,
        proteinEaten,
        proteinGoalMet: proteinTarget > 0 ? proteinEaten >= proteinTarget : false,
        fatEaten,
        fatGoalMet: fatTarget > 0 ? fatEaten >= fatTarget : false,
      });
    });

    return history.reverse(); // Most recent last for the chart
  }, [historicalCalories, historicalExercises, bmr, macroTargets]);

  // Chatbot script
  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (!(window as any).chatbase || (window as any).chatbase("getState") !== "initialized") {
      (window as any).chatbase = (...args: unknown[]) => {
        if (!(window as any).chatbase.q) {
          (window as any).chatbase.q = [];
        }
        (window as any).chatbase.q.push(args);
      };
      (window as any).chatbase = new Proxy((window as any).chatbase, {
        get(target: any, prop: string) {
          if (prop === "q") {
            return target.q;
          }
          return (...args: unknown[]) => target(prop, ...args);
        }
      });
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const onLoad = () => {
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "yxdmue04A17dG_tIi0cFP";
      script.defer = true;
      document.body.appendChild(script);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
    }

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const navigateDay = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const totalConsumed = todayCalories.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalBurnt = todayExercises.reduce((sum, item) => sum + (Number(item.calories_burned) || 0), 0);
  const calorieBalance = bmr - totalConsumed + totalBurnt;

  // Determine if deficit or surplus
  const isDeficit = calorieBalance >= 0;
  const deficitSurplusAmount = Math.abs(calorieBalance);

  // Calculate macros consumed today
  const macrosConsumed = {
    carbs: todayCalories.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0),
    protein: todayCalories.reduce((sum, item) => sum + (Number(item.protein) || 0), 0),
    fat: todayCalories.reduce((sum, item) => sum + (Number(item.fat) || 0), 0)
  };

  // Macro targets as numbers
  const targets = {
    calories: parseInt(macroTargets.calories) || 0,
    carbs: parseInt(macroTargets.carbs) || 0,
    protein: parseInt(macroTargets.protein) || 0,
    fat: parseInt(macroTargets.fat) || 0
  };

  const addCalorieEntry = async () => {
    if (!calorieInput.calories || parseInt(calorieInput.calories) <= 0) return;

    try {
      await addCalorieToSupabase({
        food_name: calorieInput.name || 'Unnamed Food',
        calories: parseInt(calorieInput.calories),
        carbs: parseInt(calorieInput.carbs || '0'),
        protein: parseInt(calorieInput.protein || '0'),
        fat: parseInt(calorieInput.fat || '0'),
      });

      setCalorieInput({ name: '', calories: '', carbs: '', protein: '', fat: '' });
      setShowCalorieForm(false);
    } catch (error) {
      console.error('Error adding calorie entry:', error);
      alert('Failed to add calorie entry. Please try again.');
    }
  };

  const addTemplatedFood = async () => {
    if (!selectedTemplate || !templateQuantity || parseInt(templateQuantity) <= 0) return;

    const quantity = parseInt(templateQuantity);
    try {
      await addCalorieToSupabase({
        food_name: `${selectedTemplate.name} (${quantity}x)`,
        calories: Number(selectedTemplate.calories) * quantity,
        carbs: Number(selectedTemplate.carbs) * quantity,
        protein: Number(selectedTemplate.protein) * quantity,
        fat: Number(selectedTemplate.fat) * quantity,
      });

      setSelectedTemplate(null);
      setTemplateQuantity('1');
      setShowTemplateForm(false);
    } catch (error) {
      console.error('Error adding templated food:', error);
      alert('Failed to add templated food. Please try again.');
    }
  };

  const addExerciseEntry = async () => {
    if (!exerciseInput.duration || !exerciseInput.caloriesBurned ||
        parseInt(exerciseInput.duration) <= 0 || parseInt(exerciseInput.caloriesBurned) <= 0) return;

    try {
      await addExerciseToSupabase({
        exercise_type: exerciseInput.type || 'Unnamed Exercise',
        duration_minutes: parseInt(exerciseInput.duration),
        calories_burned: parseInt(exerciseInput.caloriesBurned),
      });

      setExerciseInput({ type: '', duration: '', caloriesBurned: '' });
      setShowExerciseForm(false);
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      alert('Failed to add exercise entry. Please try again.');
    }
  };

  const removeCalorieEntry = async (id: string) => {
    try {
      await removeCalorieFromSupabase(id);
    } catch (error) {
      console.error('Error removing calorie entry:', error);
      alert('Failed to remove calorie entry. Please try again.');
    }
  };

  const removeExerciseEntry = async (id: string) => {
    try {
      await removeExerciseFromSupabase(id);
    } catch (error) {
      console.error('Error removing exercise entry:', error);
      alert('Failed to remove exercise entry. Please try again.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header with Date Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading mb-2">Calorie Tracker</h1>
          <p className="text-mm-gray">Track your daily calorie consumption and expenditure</p>
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
            <div className="text-3xl font-heading text-mm-white" suppressHydrationWarning>
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
          >
            <ChevronRightIcon className="w-8 h-8 text-mm-gray" />
          </button>
        </div>
      </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Food Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading">Food</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateForm(true)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  <RectangleStackIcon className="w-4 h-4 mr-2" />
                  Templated Food
                </button>
                <button
                  onClick={() => setShowCalorieForm(true)}
                  className="btn-mm py-2 px-4 text-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Food
                </button>
              </div>
            </div>

            {showCalorieForm && (
              <div className="card-mm mb-4 p-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Food name (optional)"
                    value={calorieInput.name}
                    onChange={(e) => setCalorieInput({ ...calorieInput, name: e.target.value })}
                    className="input-mm w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Calories"
                      value={calorieInput.calories}
                      onChange={(e) => setCalorieInput({ ...calorieInput, calories: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={calorieInput.carbs}
                      onChange={(e) => setCalorieInput({ ...calorieInput, carbs: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={calorieInput.protein}
                      onChange={(e) => setCalorieInput({ ...calorieInput, protein: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={calorieInput.fat}
                      onChange={(e) => setCalorieInput({ ...calorieInput, fat: e.target.value })}
                      className="input-mm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addCalorieEntry} className="btn-mm py-2 px-4 text-sm">
                      Add Entry
                    </button>
                    <button
                      onClick={() => setShowCalorieForm(false)}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showTemplateForm && (
              <div className="card-mm mb-4 p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-heading mb-3">Select Food Template</h3>
                  
                  {foodTemplates.length === 0 ? (
                    <div className="text-center py-6 text-mm-gray">
                      <p>No food templates available</p>
                      <p className="text-xs mt-1">Create templates in Settings to use this feature</p>
                    </div>
                  ) : (
                    <>
                      {/* Template Selection */}
                      <div>
                        <label className="block text-sm text-mm-gray mb-2">Choose Template</label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                          {foodTemplates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => setSelectedTemplate(template)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedTemplate?.id === template.id
                                  ? 'bg-mm-blue/20 border-mm-blue'
                                  : 'bg-mm-dark2 border-mm-gray/20 hover:border-mm-gray/40'
                              }`}
                            >
                              <div className="font-semibold">{template.name}</div>
                              <div className="flex flex-wrap gap-3 text-sm text-mm-gray mt-1">
                                <span className="text-orange-500">{template.calories} cal</span>
                                <span>C: {template.carbs}g</span>
                                <span>P: {template.protein}g</span>
                                <span>F: {template.fat}g</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Input */}
                      {selectedTemplate && (
                        <div>
                          <label className="block text-sm text-mm-gray mb-2">Quantity</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={templateQuantity}
                            onChange={(e) => setTemplateQuantity(e.target.value)}
                            className="input-mm w-full"
                            min="1"
                          />
                          
                          {/* Preview */}
                          <div className="mt-3 p-3 bg-mm-dark2 rounded-lg border border-mm-gray/20">
                            <p className="text-sm font-semibold mb-2">Preview (x{templateQuantity})</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="text-orange-500">
                                {(selectedTemplate.calories ?? 0) * parseInt(templateQuantity || '1')} cal
                              </span>
                              <span className="text-mm-gray">
                                C: {(selectedTemplate.carbs ?? 0) * parseInt(templateQuantity || '1')}g
                              </span>
                              <span className="text-mm-gray">
                                P: {(selectedTemplate.protein ?? 0) * parseInt(templateQuantity || '1')}g
                              </span>
                              <span className="text-mm-gray">
                                F: {(selectedTemplate.fat ?? 0) * parseInt(templateQuantity || '1')}g
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={addTemplatedFood}
                      disabled={!selectedTemplate || !templateQuantity || parseInt(templateQuantity) <= 0}
                      className="btn-mm py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Entry
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateForm(false);
                        setSelectedTemplate(null);
                        setTemplateQuantity('1');
                      }}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {todayCalories.length === 0 ? (
                <div className="card-mm p-8 text-center">
                  <p className="text-mm-gray">No food entries yet</p>
                </div>
              ) : (
                todayCalories.map((item) => (
                  <div key={item.id} className="card-mm p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.food_name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-mm-blue">{Number(item.calories) || 0} cal</span>
                          <span className="text-mm-gray">C: {Math.round(Number(item.carbs) || 0)}g</span>
                          <span className="text-mm-gray">P: {Math.round(Number(item.protein) || 0)}g</span>
                          <span className="text-mm-gray">F: {Math.round(Number(item.fat) || 0)}g</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCalorieEntry(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Exercise Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading">Exercise</h2>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="btn-mm py-2 px-4 text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Exercise
              </button>
            </div>

            {showExerciseForm && (
              <div className="card-mm mb-4 p-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Exercise type (optional)"
                    value={exerciseInput.type}
                    onChange={(e) => setExerciseInput({ ...exerciseInput, type: e.target.value })}
                    className="input-mm w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Duration (min)"
                      value={exerciseInput.duration}
                      onChange={(e) => setExerciseInput({ ...exerciseInput, duration: e.target.value })}
                      className="input-mm"
                    />
                    <input
                      type="number"
                      placeholder="Calories burned"
                      value={exerciseInput.caloriesBurned}
                      onChange={(e) => setExerciseInput({ ...exerciseInput, caloriesBurned: e.target.value })}
                      className="input-mm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addExerciseEntry} className="btn-mm py-2 px-4 text-sm">
                      Add Entry
                    </button>
                    <button
                      onClick={() => setShowExerciseForm(false)}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {todayExercises.length === 0 ? (
                <div className="card-mm p-8 text-center">
                  <p className="text-mm-gray">No exercise entries yet</p>
                </div>
              ) : (
                todayExercises.map((item) => (
                  <div key={item.id} className="card-mm p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.exercise_type}</h3>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-500">{Number(item.calories_burned) || 0} cal</span>
                          <span className="text-mm-gray">{item.duration_minutes || 0} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeExerciseEntry(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="mt-16 flex justify-center">
          <div className="w-1/2">
            <div className="card-mm p-6 bg-gradient-to-br from-mm-dark2 to-mm-dark">
              <h3 className="text-lg font-heading mb-4 text-center">Daily Summary</h3>
              
              <div className="flex justify-center">
                <div className="w-2/3">
                  <table className="w-full">
                <thead>
                  <tr className="border-b border-mm-gray/20">
                    <th className="text-left py-2 text-sm font-semibold text-mm-gray">Metric</th>
                    <th className="text-right py-2 text-sm font-semibold text-mm-gray">Current</th>
                    <th className="text-right py-2 text-sm font-semibold text-mm-gray">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mm-gray/20">
                  <tr>
                    <td className="py-2 text-mm-white">Consumed</td>
                    <td className="py-2 text-right text-mm-gray font-semibold">{totalConsumed}</td>
                    <td className="py-2 text-right text-mm-gray">
                      {targets.calories > 0 ? targets.calories : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-mm-white">Burned</td>
                    <td className="py-2 text-right text-mm-gray font-semibold">{totalBurnt}</td>
                    <td className="py-2 text-right text-mm-gray">—</td>
                  </tr>
                  <tr className="border-b-0">
                    <td className="py-2 text-mm-white">Calorie balance</td>
                    <td className={`py-2 text-right font-semibold ${isDeficit ? 'text-green-500' : 'text-red-500'}`}>
                      {deficitSurplusAmount}
                    </td>
                    <td className="py-2 text-right text-mm-gray">—</td>
                  </tr>
                  <tr><td colSpan={3} className="py-4"></td></tr>
                  <tr>
                    <td className="py-2 text-mm-white">Carbs</td>
                    <td className={`py-2 text-right font-semibold ${
                      targets.carbs > 0 
                        ? (macrosConsumed.carbs <= targets.carbs ? 'text-green-500' : 'text-red-500')
                        : 'text-mm-gray'
                    }`}>
                      {Math.round(macrosConsumed.carbs)}g
                    </td>
                    <td className="py-2 text-right text-mm-gray">
                      {targets.carbs > 0 ? `${targets.carbs}g` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-mm-white">Protein</td>
                    <td className={`py-2 text-right font-semibold ${
                      targets.protein > 0 
                        ? (macrosConsumed.protein <= targets.protein ? 'text-green-500' : 'text-red-500')
                        : 'text-mm-gray'
                    }`}>
                      {Math.round(macrosConsumed.protein)}g
                    </td>
                    <td className="py-2 text-right text-mm-gray">
                      {targets.protein > 0 ? `${targets.protein}g` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-mm-white">Fat</td>
                    <td className={`py-2 text-right font-semibold ${
                      targets.fat > 0 
                        ? (macrosConsumed.fat <= targets.fat ? 'text-green-500' : 'text-red-500')
                        : 'text-mm-gray'
                    }`}>
                      {Math.round(macrosConsumed.fat)}g
                    </td>
                    <td className="py-2 text-right text-mm-gray">
                      {targets.fat > 0 ? `${targets.fat}g` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day History Table */}
        <div className="mt-8 card-mm">
          <div className="p-6 border-b border-mm-gray/20">
            <h3 className="text-lg font-heading">30-Day Calorie History</h3>
            <p className="text-sm text-mm-gray mt-1">Your daily calorie tracking over the last 30 days</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mm-dark2/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Food Consumed</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Exercise Burnt</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Balance</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Protein Eaten</th>
                  <th className="text-center p-4 text-sm font-semibold text-mm-gray">Protein Goal</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Fat Eaten</th>
                  <th className="text-center p-4 text-sm font-semibold text-mm-gray">Fat Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mm-gray/20">
                {historyData.map((day) => (
                  <tr key={day.date} className="hover:bg-mm-dark2/30 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatDateForDisplay(day.date)}
                        </div>
                        <div className="text-mm-gray text-xs">
                          {day.date}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-mm-gray">
                        {day.foodConsumed > 0 ? `${day.foodConsumed} cal` : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-mm-gray">
                        {day.exerciseBurnt > 0 ? `${day.exerciseBurnt} cal` : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      {day.foodConsumed === 0 && day.exerciseBurnt === 0 ? (
                        <span className="font-medium text-mm-gray">—</span>
                      ) : (
                        <div className="text-sm">
                          <div className={`font-medium ${day.calorieBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(day.calorieBalance)} cal
                          </div>
                          <div className="text-xs text-mm-gray">
                            {day.calorieBalance >= 0 ? 'Deficit' : 'Surplus'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${day.proteinEaten > 0 ? 'text-blue-500' : 'text-mm-gray'}`}>
                        {day.proteinEaten > 0 ? `${day.proteinEaten}g` : '—'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {day.proteinEaten > 0 ? (
                        day.proteinGoalMet ? (
                          <span className="text-green-500 text-lg">✓</span>
                        ) : (
                          <span className="text-red-500 text-lg">✗</span>
                        )
                      ) : (
                        <span className="text-mm-gray">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${day.fatEaten > 0 ? 'text-yellow-500' : 'text-mm-gray'}`}>
                        {day.fatEaten > 0 ? `${day.fatEaten}g` : '—'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {day.fatEaten > 0 ? (
                        day.fatGoalMet ? (
                          <span className="text-green-500 text-lg">✓</span>
                        ) : (
                          <span className="text-red-500 text-lg">✗</span>
                        )
                      ) : (
                        <span className="text-mm-gray">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {historyData.every(day => day.foodConsumed === 0 && day.exerciseBurnt === 0) && (
            <div className="p-8 text-center">
              <p className="text-mm-gray">No calorie data in the last 30 days</p>
              <p className="text-sm text-mm-gray/70 mt-1">Start tracking your food and exercise above</p>
            </div>
          )}
        </div>
      </div>
  );
}