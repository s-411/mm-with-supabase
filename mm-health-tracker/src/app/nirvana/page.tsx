'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { nirvanaSessionStorage, nirvanaSessionTypesStorage, nirvanaProgressStorage, timezoneStorage } from '@/lib/storage';
import { NirvanaSession, NirvanaMilestone, PersonalRecord } from '@/types';
import { formatDateLong } from '@/lib/dateUtils';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  TrophyIcon,
  CheckCircleIcon,
  PencilIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

export default function NirvanaPage() {
  const [currentDate, setCurrentDate] = useState(timezoneStorage.getCurrentDate());
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [todaySessions, setTodaySessions] = useState<NirvanaSession[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ [key: string]: NirvanaSession[] }>({});
  const [milestones, setMilestones] = useState<NirvanaMilestone[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [showRecordModal, setShowRecordModal] = useState<string | null>(null);
  const [recordValue, setRecordValue] = useState('');

  const loadProgress = useCallback(() => {
    const progress = nirvanaProgressStorage.get();
    setMilestones(progress.milestones);
    setPersonalRecords(progress.personalRecords);
  }, []);

  const loadSessions = useCallback(() => {
    const entry = nirvanaSessionStorage.getByDate(currentDate);
    setTodaySessions(entry?.sessions || []);
  }, [currentDate]);

  const loadWeeklyData = useCallback(() => {
    const weekStart = getWeekStart(currentDate);
    const weekData: { [date: string]: NirvanaSession[] } = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart + 'T12:00:00');
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      weekData[dateString] = entry?.sessions || [];
    }

    setWeeklyData(weekData);
  }, [currentDate]);

  // Get the start of the week (Monday) for a given date
  const getWeekStart = (date: string) => {
    const d = new Date(date + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  useEffect(() => {
    // Load session types
    const types = nirvanaSessionTypesStorage.get();
    setSessionTypes(types);

    // Load today's sessions
    loadSessions();

    // Load weekly data
    loadWeeklyData();

    // Load progress data
    loadProgress();
  }, [currentDate, loadSessions, loadWeeklyData, loadProgress]);
  
  // Get all days in the current week (full week regardless of selected date)
  // const getCurrentWeekDays = () => {
  //   const weekStart = getWeekStart(currentDate);
  //   const start = new Date(weekStart + 'T12:00:00');
  //
  //   const days: string[] = [];
  //
  //   // Always get all 7 days of the week
  //   for (let i = 0; i < 7; i++) {
  //     const day = new Date(start);
  //     day.setDate(start.getDate() + i);
  //     const dayString = day.toISOString().split('T')[0];
  //     days.push(dayString);
  //   }
  //
  //   return days;
  // };
  
  
  const navigateDay = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };
  
  const isToday = timezoneStorage.isToday(currentDate);
  
  const addSession = (sessionType: string) => {
    nirvanaSessionStorage.addSession(currentDate, sessionType);
    loadSessions();
    loadWeeklyData(); // Refresh weekly data
  };
  
  const removeSession = (sessionId: string) => {
    nirvanaSessionStorage.removeSession(currentDate, sessionId);
    loadSessions();
    loadWeeklyData(); // Refresh weekly data
  };
  
  // Group sessions by type for display
  const sessionCounts: { [key: string]: number } = {};
  todaySessions.forEach(session => {
    sessionCounts[session.sessionType] = (sessionCounts[session.sessionType] || 0) + 1;
  });
  
  // Format time from timestamp
  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get day name from date string
  // const getDayName = (dateString: string) => {
  //   const date = new Date(dateString + 'T12:00:00');
  //   return date.toLocaleDateString('en-US', { weekday: 'long' });
  // };

  // Get short day name from date string
  // const getShortDayName = (dateString: string) => {
  //   const date = new Date(dateString + 'T12:00:00');
  //   return date.toLocaleDateString('en-US', { weekday: 'short' });
  // };
  
  // Calculate weekly session counts by type
  const getWeeklySessionCounts = () => {
    const counts: { [key: string]: number } = {};
    
    Object.values(weeklyData).forEach(daySessions => {
      daySessions.forEach(session => {
        counts[session.sessionType] = (counts[session.sessionType] || 0) + 1;
      });
    });
    
    return counts;
  };
  
  // Get total sessions for the week
  const getWeeklyTotal = () => {
    return Object.values(weeklyData).reduce((total, daySessions) => total + daySessions.length, 0);
  };
  
  // Progress tracking handlers
  const toggleMilestone = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      nirvanaProgressStorage.updateMilestone(milestoneId, !milestone.completed);
      loadProgress();
    }
  };
  
  const updatePersonalRecord = (recordId: string) => {
    const value = parseFloat(recordValue);
    if (!isNaN(value) && value >= 0) {
      nirvanaProgressStorage.updatePersonalRecord(recordId, value);
      loadProgress();
      setShowRecordModal(null);
      setRecordValue('');
    }
  };
  
  const openRecordModal = (recordId: string) => {
    const record = personalRecords.find(r => r.id === recordId);
    if (record) {
      setRecordValue(record.value.toString());
      setShowRecordModal(recordId);
    }
  };
  
  const formatRecordValue = (record: PersonalRecord) => {
    if (record.value === 0) return 'Not set';
    return `${record.value}${record.unit}`;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handstand': return StarIconSolid;
      case 'strength': return TrophyIcon;
      case 'flexibility': return SparklesIcon;
      case 'balance': return CheckCircleIcon;
      default: return StarIcon;
    }
  };
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading mb-2">Nirvana Life Training</h1>
          <p className="text-mm-gray">Track your gymnastics and mobility sessions</p>
        </div>
        
        {/* Date Navigation */}
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
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Available Sessions */}
        <div>
          <div className="card-mm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-mm-blue/20 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-mm-blue" />
              </div>
              <h2 className="text-xl font-heading text-mm-white">Available Classes</h2>
            </div>
            
            <div className="space-y-2">
              {sessionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => addSession(type)}
                  className="w-full text-left px-4 py-3 bg-mm-dark2 hover:bg-mm-dark2/80 border border-mm-gray/20 hover:border-mm-blue/30 rounded-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-mm-white group-hover:text-mm-blue transition-colors">
                      {type}
                    </span>
                    {sessionCounts[type] && (
                      <span className="text-xs text-mm-gray bg-mm-blue/10 px-2 py-1 rounded-full">
                        {sessionCounts[type]}x today
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {sessionTypes.length === 0 && (
              <div className="text-center py-8 text-mm-gray">
                <p>No session types configured.</p>
                <p className="text-sm mt-2">Add session types in Settings → Nirvana.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Sessions Completed */}
        <div>
          <div className="card-mm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-xl font-heading text-mm-white">Sessions Completed</h2>
              {todaySessions.length > 0 && (
                <span className="ml-auto text-sm text-mm-gray bg-green-500/10 px-3 py-1 rounded-full">
                  {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {todaySessions.length === 0 ? (
                <div className="text-center py-12 text-mm-gray">
                  <p>No sessions logged yet.</p>
                  <p className="text-sm mt-2">Click on a class to log it.</p>
                </div>
              ) : (
                todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between px-4 py-3 bg-mm-dark2 border border-green-500/20 rounded-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-mm-white">{session.sessionType}</span>
                      <span className="text-xs text-mm-gray">
                        {formatTime(session.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSession(session.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                      title="Remove session"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Summary */}
            {todaySessions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-mm-gray/20">
                <h3 className="text-sm font-heading text-mm-gray mb-3">Session Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(sessionCounts).map(([type, count]) => (
                    <div key={type} className="bg-mm-dark2 rounded-lg px-3 py-2">
                      <div className="text-xs text-mm-gray">{type}</div>
                      <div className="text-lg font-heading text-mm-white">
                        {count} session{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Weekly Reporting */}
      {Object.keys(weeklyData).length > 0 && (
        <div className="mt-12 space-y-8">
          {/* Weekly Schedule Table */}
          <div className="card-mm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-heading text-mm-white">Weekly Schedule</h2>
                <p className="text-sm text-mm-gray">Sessions by day this week</p>
              </div>
              {getWeeklyTotal() > 0 && (
                <span className="ml-auto text-sm text-mm-gray bg-indigo-500/10 px-3 py-1 rounded-full">
                  {getWeeklyTotal()} total sessions
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-7 gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName, index) => {
                const weekStart = getWeekStart(currentDate);
                const dayDate = new Date(weekStart + 'T12:00:00');
                dayDate.setDate(dayDate.getDate() + index);
                const dayString = dayDate.toISOString().split('T')[0];
                const daySessions = weeklyData[dayString] || [];
                const today = timezoneStorage.getCurrentDate();
                const isCurrentDay = dayString === currentDate;
                const isToday = dayString === today;
                const isUpcoming = dayDate > new Date(today + 'T12:00:00');
                
                return (
                  <div key={dayName} className={`border rounded-lg p-3 ${
                    isCurrentDay 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : isToday
                        ? 'border-blue-500 bg-blue-500/10'
                        : isUpcoming 
                          ? 'border-mm-gray/10 bg-mm-gray/5' 
                          : 'border-mm-gray/20 bg-mm-dark2/50'
                  }`}>
                    <div className="text-center mb-2">
                      <div className={`text-sm font-heading ${
                        isCurrentDay 
                          ? 'text-indigo-400' 
                          : isToday 
                            ? 'text-blue-400' 
                            : isUpcoming && daySessions.length === 0
                              ? 'text-mm-gray/50' 
                              : 'text-mm-white'
                      }`}>
                        {dayName.slice(0, 3)}
                      </div>
                      <div className={`text-xs ${
                        isCurrentDay 
                          ? 'text-indigo-300' 
                          : isToday
                            ? 'text-blue-300'
                            : isUpcoming && daySessions.length === 0
                              ? 'text-mm-gray/40' 
                              : 'text-mm-gray'
                      }`}>
                        {dayDate.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {daySessions.length === 0 ? (
                        <div className={`text-xs text-center py-2 ${
                          isUpcoming ? 'text-mm-gray/30' : 'text-mm-gray/50'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'No sessions'}
                        </div>
                      ) : (
                        daySessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className={`text-xs p-1 rounded text-center ${
                            isCurrentDay 
                              ? 'bg-indigo-500/20 text-indigo-200' 
                              : isToday
                                ? 'bg-blue-500/20 text-blue-200'
                                : 'bg-mm-dark text-mm-white'
                          }`}>
                            {session.sessionType}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Weekly Summary by Session Type */}
          <div className="card-mm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-heading text-mm-white">Weekly Summary</h2>
                <p className="text-sm text-mm-gray">Session counts by type this week</p>
              </div>
            </div>
            
            {getWeeklyTotal() === 0 ? (
              <div className="text-center py-8 text-mm-gray">
                <p>No sessions logged this week yet.</p>
                <p className="text-sm mt-2">Add sessions above to see your weekly summary.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getWeeklySessionCounts())
                  .sort(([,a], [,b]) => b - a) // Sort by count descending
                  .map(([sessionType, count]) => (
                    <div key={sessionType} className="bg-mm-dark2 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-heading text-mm-white truncate" title={sessionType}>
                          {sessionType}
                        </h3>
                        <span className="text-lg font-heading text-emerald-400">
                          {count}
                        </span>
                      </div>
                      <div className="text-xs text-mm-gray">
                        session{count !== 1 ? 's' : ''} this week
                      </div>
                      
                      {/* Simple progress bar */}
                      <div className="mt-2 bg-mm-dark rounded-full h-1">
                        <div 
                          className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, (count / Math.max(...Object.values(getWeeklySessionCounts()))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Progress Tracking Section */}
      <div className="mt-12 space-y-8">
        {/* Handstand Milestones */}
        <div className="card-mm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Progress Milestones</h2>
              <p className="text-sm text-mm-gray">Track your handstand and gymnastics journey</p>
            </div>
            <span className="ml-auto text-sm text-mm-gray bg-purple-500/10 px-3 py-1 rounded-full">
              {milestones.filter(m => m.completed).length}/{milestones.length} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones
              .sort((a, b) => a.order - b.order)
              .map((milestone) => {
                const Icon = getCategoryIcon(milestone.category);
                return (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105 ${
                      milestone.completed
                        ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                        : 'bg-mm-dark2 border-mm-gray/20 hover:border-purple-500/30'
                    }`}
                    onClick={() => toggleMilestone(milestone.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${milestone.completed ? 'text-green-500' : 'text-purple-500'}`} />
                        <div className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(milestone.difficulty)} text-white`}>
                          {milestone.difficulty}
                        </div>
                      </div>
                      {milestone.completed ? (
                        <CheckCircleIconSolid className="w-6 h-6 text-green-500" />
                      ) : (
                        <CheckCircleIcon className="w-6 h-6 text-mm-gray" />
                      )}
                    </div>
                    
                    <h3 className={`font-heading mb-2 ${milestone.completed ? 'text-green-400' : 'text-mm-white'}`}>
                      {milestone.title}
                    </h3>
                    
                    <p className="text-sm text-mm-gray mb-3">
                      {milestone.description}
                    </p>
                    
                    {milestone.targetValue && (
                      <div className="text-xs text-mm-gray">
                        Target: {milestone.targetValue}{milestone.unit}
                      </div>
                    )}
                    
                    {milestone.completed && milestone.completedDate && (
                      <div className="text-xs text-green-400 mt-2">
                        Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Personal Records */}
        <div className="card-mm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Personal Records</h2>
              <p className="text-sm text-mm-gray">Track your best performances</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalRecords.map((record) => {
              const Icon = getCategoryIcon(record.category);
              return (
                <div
                  key={record.id}
                  className="bg-mm-dark2 rounded-lg p-4 border border-mm-gray/20 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-mm-gray capitalize">{record.category}</span>
                    </div>
                    <button
                      onClick={() => openRecordModal(record.id)}
                      className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                      title="Update record"
                    >
                      <PencilIcon className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>
                  
                  <h3 className="font-heading text-mm-white mb-2">{record.name}</h3>
                  
                  <div className="text-lg font-heading text-blue-500 mb-1">
                    {formatRecordValue(record)}
                  </div>
                  
                  {record.value > 0 && (
                    <div className="text-xs text-mm-gray">
                      Set: {new Date(record.recordDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  {record.previousValue && record.previousValue > 0 && (
                    <div className="text-xs text-green-400 mt-1">
                      Previous: {record.previousValue}{record.unit}
                      {record.value > record.previousValue && (
                        <span className="ml-1">↗ +{(record.value - record.previousValue).toFixed(1)}</span>
                      )}
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="text-xs text-mm-gray mt-2 italic">
                      {record.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Record Update Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-mm-dark border border-mm-gray/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-heading text-mm-white mb-4">
              Update Personal Record
            </h3>
            
            {(() => {
              const record = personalRecords.find(r => r.id === showRecordModal);
              return record ? (
                <>
                  <p className="text-mm-gray mb-4">{record.name}</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-mm-gray mb-2">
                        New Value ({record.unit})
                      </label>
                      <input
                        type="number"
                        value={recordValue}
                        onChange={(e) => setRecordValue(e.target.value)}
                        className="input-mm w-full"
                        placeholder={`Enter value in ${record.unit}`}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    {record.value > 0 && (
                      <div className="text-sm text-mm-gray">
                        Current: {formatRecordValue(record)}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => updatePersonalRecord(showRecordModal)}
                        className="btn-mm flex-1"
                        disabled={!recordValue || parseFloat(recordValue) < 0}
                      >
                        Update Record
                      </button>
                      <button
                        onClick={() => {
                          setShowRecordModal(null);
                          setRecordValue('');
                        }}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}