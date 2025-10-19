'use client';

import React, { useState, useEffect } from 'react';
import { dailyEntryStorage, compoundStorage, injectionTargetStorage, timezoneStorage } from '@/lib/storage';
import { InjectionEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { formatDate, formatTime, formatDateForDisplay } from '@/lib/dateUtils';
import { 
  BeakerIcon, 
  XMarkIcon, 
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type TimeRange = '3' | '7' | '30' | '60' | '90' | 'all';
type CompoundFilter = 'all' | 'Ipamorellin' | 'Retatrutide' | 'Testosterone' | 'custom';

export default function InjectionsPage() {
  const [allInjections, setAllInjections] = useState<InjectionEntry[]>([]);
  const [filteredInjections, setFilteredInjections] = useState<InjectionEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [compoundFilter, setCompoundFilter] = useState<CompoundFilter>('all');
  const [compounds, setCompounds] = useState<string[]>([]);
  const [injectionInput, setInjectionInput] = useState({
    compound: '',
    dosage: '',
    unit: 'mg',
    notes: '',
    date: timezoneStorage.getCurrentDate(),
    time: '12:00'
  });
  const units = ['mg', 'ml', 'iu', 'mcg'];

  useEffect(() => {
    loadAllInjections();
    loadCompounds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allInjections, timeRange, compoundFilter]);

  const loadCompounds = () => {
    const storedCompounds = compoundStorage.get();
    setCompounds(storedCompounds);
    
    // Set default compound if available
    if (storedCompounds.length > 0 && !injectionInput.compound) {
      setInjectionInput(prev => ({ ...prev, compound: storedCompounds[0] }));
    }
  };

  const loadAllInjections = () => {
    const dailyEntries = dailyEntryStorage.getAll();
    const injections: InjectionEntry[] = [];

    Object.values(dailyEntries).forEach(entry => {
      injections.push(...entry.injections);
    });

    // Sort by timestamp, newest first
    injections.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllInjections(injections);
  };

  const applyFilters = () => {
    let filtered = [...allInjections];

    // Time range filter
    if (timeRange !== 'all') {
      const daysBack = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      
      filtered = filtered.filter(injection => 
        new Date(injection.timestamp) >= cutoffDate
      );
    }

    // Compound filter
    if (compoundFilter !== 'all') {
      if (compoundFilter === 'custom') {
        filtered = filtered.filter(injection => 
          !compounds.includes(injection.compound)
        );
      } else {
        filtered = filtered.filter(injection => 
          injection.compound === compoundFilter
        );
      }
    }

    setFilteredInjections(filtered);
  };

  const addInjection = () => {
    if (!injectionInput.dosage || parseFloat(injectionInput.dosage) <= 0) return;

    const newInjection: InjectionEntry = {
      id: uuidv4(),
      compound: injectionInput.compound,
      dosage: parseFloat(injectionInput.dosage),
      unit: injectionInput.unit,
      notes: injectionInput.notes || undefined,
      timestamp: new Date(`${injectionInput.date}T${injectionInput.time}:00`)
    };

    // Add to the correct daily entry
    const existingEntry = dailyEntryStorage.getByDate(injectionInput.date);
    const updatedInjections = existingEntry 
      ? [...existingEntry.injections, newInjection]
      : [newInjection];

    dailyEntryStorage.createOrUpdate(injectionInput.date, { 
      injections: updatedInjections 
    });

    // Reset form and reload
    setInjectionInput({
      compound: compounds.length > 0 ? compounds[0] : '',
      dosage: '',
      unit: 'mg',
      notes: '',
      date: timezoneStorage.getCurrentDate(),
      time: '12:00'
    });
    loadAllInjections();
  };

  const removeInjection = (injectionId: string) => {
    // Find which date this injection belongs to and remove it
    const injection = allInjections.find(inj => inj.id === injectionId);
    if (!injection) return;

    const injectionDate = injection.timestamp.toISOString().split('T')[0];
    const dailyEntry = dailyEntryStorage.getByDate(injectionDate);
    
    if (dailyEntry) {
      const updatedInjections = dailyEntry.injections.filter(inj => inj.id !== injectionId);
      dailyEntryStorage.createOrUpdate(injectionDate, { injections: updatedInjections });
      loadAllInjections();
    }
  };

  // Calculate frequency analysis with weekly dosage
  const getFrequencyAnalysis = () => {
    const analysis: Record<string, { 
      count: number; 
      lastInjection: Date; 
      weeklyDosage: number;
      totalDosage: number;
    }> = {};
    
    // Get last 7 days for weekly calculation
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    filteredInjections.forEach(injection => {
      if (!analysis[injection.compound]) {
        analysis[injection.compound] = { 
          count: 0, 
          lastInjection: injection.timestamp,
          weeklyDosage: 0,
          totalDosage: 0
        };
      }
      analysis[injection.compound].count++;
      analysis[injection.compound].totalDosage += injection.dosage;
      
      // Add to weekly dosage if within last 7 days
      if (new Date(injection.timestamp) >= weekAgo) {
        analysis[injection.compound].weeklyDosage += injection.dosage;
      }
      
      if (injection.timestamp > analysis[injection.compound].lastInjection) {
        analysis[injection.compound].lastInjection = injection.timestamp;
      }
    });

    return analysis;
  };

  const frequencyAnalysis = getFrequencyAnalysis();
  const totalInjections = filteredInjections.length;
  const uniqueCompounds = Object.keys(frequencyAnalysis).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-2">Injection Tracker</h1>
        <p className="text-mm-gray">Track and manage your injection schedule and history</p>
      </div>

      {/* Add Injection Form - Always Visible */}
      <div className="card-mm mb-8 p-6">
        <h3 className="text-lg font-heading mb-4">Add New Injection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-mm-gray mb-2">Compound</label>
            <select
              value={injectionInput.compound}
              onChange={(e) => setInjectionInput({ ...injectionInput, compound: e.target.value })}
              className="input-mm w-full"
            >
              {compounds.map(compound => (
                <option key={compound} value={compound}>{compound}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-mm-gray mb-2">Date</label>
            <div className="relative">
              <input
                type="date"
                value={injectionInput.date}
                onChange={(e) => setInjectionInput({ ...injectionInput, date: e.target.value })}
                className="input-mm w-full cursor-pointer"
                style={{ 
                  colorScheme: 'dark',
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'all'
                }}
              />
              <div 
                className="input-mm w-full cursor-pointer flex items-center justify-between"
                onClick={() => {
                  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                  dateInput?.showPicker?.();
                }}
              >
                <span>
                  {injectionInput.date ? 
                    formatDateForDisplay(injectionInput.date) :
                    'Select date'
                  }
                </span>
                <svg className="w-4 h-4 text-mm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-mm-gray mb-2">Time</label>
            <input
              type="time"
              value={injectionInput.time}
              onChange={(e) => setInjectionInput({ ...injectionInput, time: e.target.value })}
              className="input-mm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-mm-gray mb-2">Dosage</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Amount"
                value={injectionInput.dosage}
                onChange={(e) => setInjectionInput({ ...injectionInput, dosage: e.target.value })}
                className="input-mm w-32 min-w-[100px]"
                style={{ minWidth: '100px' }}
              />
              <select
                value={injectionInput.unit}
                onChange={(e) => setInjectionInput({ ...injectionInput, unit: e.target.value })}
                className="input-mm w-20"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-mm-gray mb-2">Notes (optional)</label>
            <input
              type="text"
              placeholder="Additional notes..."
              value={injectionInput.notes}
              onChange={(e) => setInjectionInput({ ...injectionInput, notes: e.target.value })}
              className="input-mm w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={addInjection} className="btn-mm py-2 px-6">
            Add Injection
          </button>
        </div>
      </div>


      {/* Weekly Dosage Analysis with Targets */}
      {Object.keys(frequencyAnalysis).length > 0 && (
        <div className="card-mm mb-8 p-6">
          <h3 className="text-lg font-heading mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-mm-blue" />
            Weekly Dosage Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(frequencyAnalysis).map(([compound, data]) => {
              const targetProgress = injectionTargetStorage.getWeeklyProgress(compound);
              const hasTarget = targetProgress.target > 0;
              
              return (
                <div key={compound} className="bg-mm-dark2 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{compound}</h4>
                    {hasTarget && (
                      <div className="flex items-center">
                        {targetProgress.isOnTarget ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {hasTarget && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-mm-gray">Target:</span>
                          <span className="text-mm-blue font-semibold">
                            {targetProgress.target}{targetProgress.unit}/week
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-mm-gray">Actual (7 days):</span>
                          <span className={`font-semibold text-lg ${
                            targetProgress.isOnTarget ? 'text-green-400' : 
                            targetProgress.percentage < 90 ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {targetProgress.actual}{targetProgress.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-mm-gray">Progress:</span>
                          <span className={`font-semibold ${
                            targetProgress.isOnTarget ? 'text-green-400' : 
                            targetProgress.percentage < 90 ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {targetProgress.percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-mm-gray">Injection count:</span>
                          <span className="text-mm-white">
                            {targetProgress.injectionCount}/{targetProgress.targetCount}
                          </span>
                        </div>
                        <hr className="border-mm-gray/30 my-2" />
                      </>
                    )}
                    {!hasTarget && (
                      <div className="flex justify-between items-center">
                        <span className="text-mm-gray">Last 7 days:</span>
                        <span className="text-mm-blue font-semibold text-lg">{data.weeklyDosage}mg</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-mm-gray">Total injections:</span>
                      <span className="text-mm-white">{data.count}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mm-gray">Total dosage:</span>
                      <span className="text-mm-white">{data.totalDosage}mg</span>
                    </div>
                    <div>
                      <span className="text-mm-gray text-xs mb-1 block">Injections in last 7 days:</span>
                      <div className="text-xs space-y-1">
                        {(() => {
                          // Get last 7 days of injections for this compound
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          
                          const recentInjections = allInjections
                            .filter(inj => 
                              inj.compound === compound && 
                              new Date(inj.timestamp) >= weekAgo
                            )
                            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                          
                          if (recentInjections.length === 0) {
                            return <span className="text-mm-gray">None</span>;
                          }
                          
                          return recentInjections.map(inj => {
                            const date = new Date(inj.timestamp);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                            const dayNum = date.getDate();
                            const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' :
                                         dayNum === 2 || dayNum === 22 ? 'nd' :
                                         dayNum === 3 || dayNum === 23 ? 'rd' : 'th';
                            return (
                              <div key={inj.id} className="text-mm-white">
                                {dayName}, {dayNum}{suffix} ({inj.dosage}{inj.unit})
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-mm-gray" />
          <span className="text-sm text-mm-gray">Filter by:</span>
        </div>

        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="input-mm py-2 px-3 text-sm"
        >
          <option value="3">3 Days</option>
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="60">60 Days</option>
          <option value="90">90 Days</option>
          <option value="all">All Time</option>
        </select>

        {/* Compound Filter */}
        <select
          value={compoundFilter}
          onChange={(e) => setCompoundFilter(e.target.value as CompoundFilter)}
          className="input-mm py-2 px-3 text-sm"
        >
          <option value="all">All Compounds</option>
          {compounds.map(compound => (
            <option key={compound} value={compound}>{compound}</option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Injection History Table */}
      <div className="card-mm mb-8">
        <div className="p-6 border-b border-mm-gray/20">
          <h3 className="text-lg font-heading">Injection History</h3>
          <p className="text-sm text-mm-gray mt-1">
            {filteredInjections.length} injection{filteredInjections.length !== 1 ? 's' : ''}
            {timeRange !== 'all' && ` in the last ${timeRange} days`}
          </p>
        </div>

        {filteredInjections.length === 0 ? (
          <div className="p-8 text-center">
            <BeakerIcon className="w-12 h-12 text-mm-gray/50 mx-auto mb-4" />
            <p className="text-mm-gray">No injections found</p>
            <p className="text-sm text-mm-gray/70 mt-1">
              {timeRange !== 'all' ? 'Try expanding the time range or' : ''} Add your first injection above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mm-dark2/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Compound</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Dosage</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Notes</th>
                  <th className="text-left p-4 text-sm font-semibold text-mm-gray">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mm-gray/20">
                {filteredInjections.map((injection) => (
                  <tr key={injection.id} className="hover:bg-mm-dark2/30 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatDate(injection.timestamp)}
                        </div>
                        <div className="text-mm-gray text-xs">
                          {formatTime(injection.timestamp)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{injection.compound}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-mm-blue font-medium">
                        {injection.dosage} {injection.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-mm-gray">
                        {injection.notes || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => removeInjection(injection.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete injection"
                      >
                        <XMarkIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-mm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-mm-gray text-sm">Total Injections</p>
            <div className="w-10 h-10 rounded-full bg-mm-blue/20 flex items-center justify-center">
              <BeakerIcon className="w-5 h-5 text-mm-blue" />
            </div>
          </div>
          <p className="text-3xl font-heading mb-1">{totalInjections}</p>
          <p className="text-xs text-mm-gray">In {timeRange === 'all' ? 'all time' : `${timeRange} days`}</p>
        </div>

        <div className="card-mm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-mm-gray text-sm">Compounds</p>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-heading mb-1">{uniqueCompounds}</p>
          <p className="text-xs text-mm-gray">Different types</p>
        </div>

        <div className="card-mm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-mm-gray text-sm">This Week</p>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-heading mb-1">
            {allInjections.filter(inj => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(inj.timestamp) >= weekAgo;
            }).length}
          </p>
          <p className="text-xs text-mm-gray">Injections</p>
        </div>

        <div className="card-mm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-mm-gray text-sm">Last Injection</p>
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-lg font-heading mb-1">
            {allInjections.length > 0 
              ? formatDate(allInjections[0].timestamp)
              : 'None'
            }
          </p>
          <p className="text-xs text-mm-gray">
            {allInjections.length > 0 && allInjections[0].compound}
          </p>
        </div>
      </div>
    </div>
  );
}