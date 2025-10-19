'use client';

import React, { useState, useEffect } from 'react';
import { profileStorage, dailyEntryStorage, calculations, nirvanaSessionStorage, bodyPartMappingStorage, sessionCorrelationStorage } from '@/lib/storage';
import { UserProfile, NirvanaEntry, BodyPartUsage, CorrelationAnalysis } from '@/types';
import { useMacroTargets } from '@/lib/hooks/useSettings';
import { useDailyRange } from '@/lib/hooks/useDaily';
import { formatDate } from '@/lib/dateUtils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import {
  ChartBarIcon,
  ScaleIcon,
  BriefcaseIcon,
  BeakerIcon,
  TrophyIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  weightData: Array<{ date: string; weight: number; label: string }>;
  calorieBalanceData: Array<{ date: string; balance: number; label: string; consumed: number; burned: number }>;
  deepWorkData: Array<{ date: string; completed: boolean; label: string }>;
  injectionData: Array<{ compound: string; count: number; lastInjection: string }>;
  macroTrends: Array<{ date: string; protein: number; carbs: number; fat: number; label: string }>;
  mitData: Array<{ date: string; completed: number; total: number; completionRate: number; label: string }>;
  goalAchievement: {
    proteinDays: number;
    fatDays: number;
    calorieDays: number;
    totalDays: number;
  };
  nirvanaData: {
    sessionsOverTime: Array<{ date: string; count: number; label: string }>;
    sessionTypeFrequency: Array<{ sessionType: string; count: number; percentage: number }>;
    weeklyConsistency: Array<{ week: string; sessions: number; label: string }>;
    streakData: {
      currentStreak: number;
      longestStreak: number;
      activeDays: number;
      totalSessions: number;
    };
    monthlyBreakdown: Array<{ month: string; sessions: number; topType: string }>;
    dailyAverages: Array<{ dayName: string; average: number; total: number }>;
  };
  bodyPartUsage: BodyPartUsage[];
  correlationAnalysis: CorrelationAnalysis;
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [calorieBalancePeriod, setCalorieBalancePeriod] = useState<7 | 30 | 90>(30);
  const [weightTimePeriod, setWeightTimePeriod] = useState<7 | 30 | 60 | 90>(90);
  const [weightScaleMin, setWeightScaleMin] = useState<number>(75);
  const [weightScaleMax, setWeightScaleMax] = useState<number>(90);
  const [showLinearTrend, setShowLinearTrend] = useState<boolean>(false);
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(false);

  // Load macro targets from Supabase
  const { macroTargets } = useMacroTargets();

  // Calculate date range for weight data from Supabase
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - weightTimePeriod);
  const { entries: supabaseEntries } = useDailyRange(
    startDate.toISOString().split('T')[0],
    currentDate.toISOString().split('T')[0]
  );

  useEffect(() => {
    const existingProfile = profileStorage.get();
    setProfile(existingProfile);

    loadAnalyticsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calorieBalancePeriod, weightTimePeriod, supabaseEntries]);

  const loadAnalyticsData = () => {
    const data: AnalyticsData = {
      weightData: [],
      calorieBalanceData: [],
      deepWorkData: [],
      injectionData: [],
      macroTrends: [],
      mitData: [],
      goalAchievement: { proteinDays: 0, fatDays: 0, calorieDays: 0, totalDays: 0 },
      nirvanaData: {
        sessionsOverTime: [],
        sessionTypeFrequency: [],
        weeklyConsistency: [],
        streakData: { currentStreak: 0, longestStreak: 0, activeDays: 0, totalSessions: 0 },
        monthlyBreakdown: [],
        dailyAverages: []
      },
      bodyPartUsage: [],
      correlationAnalysis: {
        correlations: [],
        insights: [],
        recommendations: [],
        analysisDate: new Date()
      }
    };

    const currentDate = new Date();
    const bmr = profile?.bmr || 2000;
    
    // Get targets for calculations
    const targets = {
      calories: parseInt(macroTargets.calories) || 0,
      protein: parseInt(macroTargets.protein) || 0,
      fat: parseInt(macroTargets.fat) || 0
    };

    // Weight data from Supabase (entries are already filtered by date range from hook)
    data.weightData = supabaseEntries
      .filter(entry => entry.weight !== null && entry.weight !== undefined)
      .map(entry => ({
        date: entry.date,
        weight: entry.weight!,
        label: formatDate(new Date(entry.date + 'T12:00:00'))
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    // Calorie balance, deep work, and macro trends
    for (let i = 0; i < calorieBalancePeriod; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const metrics = calculations.calculateDailyMetrics(dateString, bmr);
      const entry = dailyEntryStorage.getByDate(dateString);

      // Calorie balance data
      data.calorieBalanceData.unshift({
        date: dateString,
        balance: metrics.calorieBalance,
        consumed: metrics.totalCaloriesConsumed,
        burned: metrics.totalCaloriesBurned,
        label: formatDate(new Date(dateString + 'T12:00:00'))
      });

      // Deep work data
      data.deepWorkData.unshift({
        date: dateString,
        completed: entry?.deepWorkCompleted || false,
        label: formatDate(new Date(dateString + 'T12:00:00'))
      });

      // MIT completion data
      const mits = entry?.mits || [];
      const completedMITs = mits.filter(mit => mit.completed).length;
      const totalMITs = mits.length;
      const completionRate = totalMITs > 0 ? Math.round((completedMITs / totalMITs) * 100) : 0;
      
      data.mitData.unshift({
        date: dateString,
        completed: completedMITs,
        total: totalMITs,
        completionRate,
        label: formatDate(new Date(dateString + 'T12:00:00'))
      });

      // Macro trends (last 30 days)
      if (i < 30) {
        data.macroTrends.unshift({
          date: dateString,
          protein: Math.round(metrics.macros.protein),
          carbs: Math.round(metrics.macros.carbs),
          fat: Math.round(metrics.macros.fat),
          label: formatDate(new Date(dateString + 'T12:00:00'))
        });

        // Goal achievement tracking
        if (metrics.totalCaloriesConsumed > 0) {
          data.goalAchievement.totalDays++;
          
          if (targets.calories > 0 && metrics.totalCaloriesConsumed <= targets.calories) {
            data.goalAchievement.calorieDays++;
          }
          if (targets.protein > 0 && metrics.macros.protein >= targets.protein) {
            data.goalAchievement.proteinDays++;
          }
          if (targets.fat > 0 && metrics.macros.fat <= targets.fat) {
            data.goalAchievement.fatDays++;
          }
        }
      }
    }

    // Injection frequency data
    const injectionCounts: Record<string, { count: number; lastDate: string }> = {};
    
    // Check last 90 days for injection patterns
    for (let i = 0; i < 90; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = dailyEntryStorage.getByDate(dateString);
      
      if (entry?.injections) {
        entry.injections.forEach(injection => {
          if (!injectionCounts[injection.compound]) {
            injectionCounts[injection.compound] = { count: 0, lastDate: dateString };
          }
          injectionCounts[injection.compound].count++;
          if (dateString > injectionCounts[injection.compound].lastDate) {
            injectionCounts[injection.compound].lastDate = dateString;
          }
        });
      }
    }

    data.injectionData = Object.entries(injectionCounts).map(([compound, data]) => ({
      compound,
      count: data.count,
      lastInjection: formatDate(new Date(data.lastDate + 'T12:00:00'))
    }));

    // Process Nirvana Sessions Data (last 90 days for comprehensive analytics)
    const nirvanaEntries: NirvanaEntry[] = [];
    for (let i = 0; i < 90; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      if (entry && entry.sessions.length > 0) {
        nirvanaEntries.push(entry);
      }
    }

    // 1. Sessions Over Time (daily count)
    data.nirvanaData.sessionsOverTime = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      const sessionCount = entry?.sessions?.length || 0;
      
      data.nirvanaData.sessionsOverTime.push({
        date: formatDate(date),
        count: sessionCount,
        label: `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
      });
    }

    // 2. Session Type Frequency (all time from 90 days)
    const sessionTypeCounts: { [key: string]: number } = {};
    let totalSessions = 0;
    
    nirvanaEntries.forEach(entry => {
      entry.sessions.forEach(session => {
        sessionTypeCounts[session.sessionType] = (sessionTypeCounts[session.sessionType] || 0) + 1;
        totalSessions++;
      });
    });

    data.nirvanaData.sessionTypeFrequency = Object.entries(sessionTypeCounts)
      .map(([sessionType, count]) => ({
        sessionType,
        count,
        percentage: Math.round((count / totalSessions) * 100) || 0
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Weekly Consistency (last 12 weeks)
    data.nirvanaData.weeklyConsistency = [];
    for (let week = 11; week >= 0; week--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - (week * 7) - weekStart.getDay() + 1);
      
      let weekSessions = 0;
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + day);
        const dateString = date.toISOString().split('T')[0];
        const entry = nirvanaSessionStorage.getByDate(dateString);
        weekSessions += entry?.sessions?.length || 0;
      }
      
      const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      data.nirvanaData.weeklyConsistency.push({
        week: weekLabel,
        sessions: weekSessions,
        label: `Week of ${weekLabel}: ${weekSessions} sessions`
      });
    }

    // 4. Streak Data
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let activeDays = 0;
    
    // Check last 90 days for streaks (consecutive days with sessions)
    for (let i = 0; i < 90; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      const hasSession = entry && entry.sessions.length > 0;
      
      if (hasSession) {
        activeDays++;
        if (i === 0) { // Today
          currentStreak++;
          tempStreak++;
        } else if (tempStreak > 0) {
          tempStreak++;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (i === 0) {
          currentStreak = 0;
        }
        tempStreak = 0;
      }
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    data.nirvanaData.streakData = {
      currentStreak,
      longestStreak,
      activeDays,
      totalSessions
    };

    // 5. Monthly Breakdown (last 6 months)
    data.nirvanaData.monthlyBreakdown = [];
    for (let month = 5; month >= 0; month--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(monthDate.getMonth() - month);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthSessions: { [key: string]: number } = {};
      let monthTotal = 0;
      
      // Get all days in the month
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      for (let day = monthStart; day <= monthEnd; day.setDate(day.getDate() + 1)) {
        const dateString = day.toISOString().split('T')[0];
        const entry = nirvanaSessionStorage.getByDate(dateString);
        if (entry) {
          entry.sessions.forEach(session => {
            monthSessions[session.sessionType] = (monthSessions[session.sessionType] || 0) + 1;
            monthTotal++;
          });
        }
      }
      
      const topType = Object.entries(monthSessions).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
      
      data.nirvanaData.monthlyBreakdown.push({
        month: monthName,
        sessions: monthTotal,
        topType
      });
    }

    // 6. Daily Averages (which days of week are most active)
    const dayAverages: { [key: string]: { total: number; days: number } } = {
      'Sunday': { total: 0, days: 0 },
      'Monday': { total: 0, days: 0 },
      'Tuesday': { total: 0, days: 0 },
      'Wednesday': { total: 0, days: 0 },
      'Thursday': { total: 0, days: 0 },
      'Friday': { total: 0, days: 0 },
      'Saturday': { total: 0, days: 0 }
    };

    for (let i = 0; i < 90; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      
      dayAverages[dayName].days++;
      dayAverages[dayName].total += entry?.sessions?.length || 0;
    }

    data.nirvanaData.dailyAverages = Object.entries(dayAverages).map(([dayName, data]) => ({
      dayName,
      average: Math.round((data.total / data.days) * 10) / 10,
      total: data.total
    }));

    // Body Part Usage Analysis (last 30 days)
    data.bodyPartUsage = bodyPartMappingStorage.getBodyPartUsage(30);

    // Session Correlation Analysis (last 60 days)
    data.correlationAnalysis = sessionCorrelationStorage.analyzeCorrelations(60);

    setAnalyticsData(data);
  };

  if (!analyticsData) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-mm-gray">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const deepWorkStreak = () => {
    const recent = analyticsData.deepWorkData.slice(-7);
    let streak = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].completed) streak++;
      else break;
    }
    return streak;
  };

  const deepWorkConsistency = () => {
    const completed = analyticsData.deepWorkData.filter(d => d.completed).length;
    return analyticsData.deepWorkData.length > 0 
      ? Math.round((completed / analyticsData.deepWorkData.length) * 100)
      : 0;
  };

  const mitOverallCompletion = () => {
    const daysWithMITs = analyticsData.mitData.filter(d => d.total > 0);
    if (daysWithMITs.length === 0) return 0;
    
    const totalCompleted = daysWithMITs.reduce((sum, day) => sum + day.completed, 0);
    const totalPlanned = daysWithMITs.reduce((sum, day) => sum + day.total, 0);
    
    return totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  };

  const mitStreak = () => {
    const recent = analyticsData.mitData.slice(-7);
    let streak = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].total > 0 && recent[i].completionRate === 100) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const averageMITsPerDay = () => {
    const daysWithMITs = analyticsData.mitData.filter(d => d.total > 0);
    if (daysWithMITs.length === 0) return 0;

    const totalMITs = daysWithMITs.reduce((sum, day) => sum + day.total, 0);
    return Math.round((totalMITs / daysWithMITs.length) * 10) / 10;
  };

  // Calculate linear regression trend line
  const calculateLinearTrend = (data: Array<{ timestamp: number; weight: number }>) => {
    if (data.length < 2) return [];

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.timestamp, 0);
    const sumY = data.reduce((sum, d) => sum + d.weight, 0);
    const sumXY = data.reduce((sum, d) => sum + d.timestamp * d.weight, 0);
    const sumXX = data.reduce((sum, d) => sum + d.timestamp * d.timestamp, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map(d => ({
      timestamp: d.timestamp,
      trend: slope * d.timestamp + intercept
    }));
  };

  // Calculate moving average (smoothed trend line)
  const calculateMovingAverage = (data: Array<{ timestamp: number; weight: number }>, windowSize: number = 7) => {
    if (data.length < windowSize) return [];

    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      const avg = window.reduce((sum, d) => sum + d.weight, 0) / window.length;

      result.push({
        timestamp: data[i].timestamp,
        movingAvg: avg
      });
    }
    return result;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-2">Analytics Dashboard</h1>
        <p className="text-mm-gray">Track your progress and identify patterns in your health journey</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="card-mm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ScaleIcon className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="font-heading text-mm-white">Weight Entries</h3>
          </div>
          <p className="text-2xl font-heading text-blue-500">{analyticsData.weightData.length}</p>
          <p className="text-xs text-mm-gray">Data points recorded</p>
        </div>

        <div className="card-mm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <BriefcaseIcon className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-heading text-mm-white">Deep Work Streak</h3>
          </div>
          <p className="text-2xl font-heading text-purple-500">{deepWorkStreak()}</p>
          <p className="text-xs text-mm-gray">Days in a row</p>
        </div>

        <div className="card-mm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrophyIcon className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="font-heading text-mm-white">Goal Success</h3>
          </div>
          <p className="text-2xl font-heading text-green-500">
            {analyticsData.goalAchievement.totalDays > 0 
              ? Math.round((analyticsData.goalAchievement.proteinDays / analyticsData.goalAchievement.totalDays) * 100)
              : 0}%
          </p>
          <p className="text-xs text-mm-gray">Protein goals hit</p>
        </div>

        <div className="card-mm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <BeakerIcon className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="font-heading text-mm-white">Injection Types</h3>
          </div>
          <p className="text-2xl font-heading text-orange-500">{analyticsData.injectionData.length}</p>
          <p className="text-xs text-mm-gray">Compounds tracked</p>
        </div>

        <div className="card-mm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="font-heading text-mm-white">MIT Success</h3>
          </div>
          <p className="text-2xl font-heading text-yellow-500">{mitOverallCompletion()}%</p>
          <p className="text-xs text-mm-gray">Tasks completed</p>
        </div>
      </div>

      {/* Weight Chart - Full Width Prominent Feature */}
      <div className="card-mm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ScaleIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Weight Progress</h2>
              <p className="text-sm text-mm-gray">Your weight journey over time</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scale Range Selectors */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-mm-gray">Scale:</label>
              <select
                value={weightScaleMin}
                onChange={(e) => setWeightScaleMin(Number(e.target.value))}
                className="input-mm text-xs py-1 px-2 pr-6"
                style={{ minWidth: '70px' }}
              >
                {[60, 65, 70, 75, 80, 85, 90, 95, 100].map((val) => (
                  <option key={val} value={val}>{val}kg</option>
                ))}
              </select>
              <span className="text-mm-gray">-</span>
              <select
                value={weightScaleMax}
                onChange={(e) => setWeightScaleMax(Number(e.target.value))}
                className="input-mm text-xs py-1 px-2 pr-6"
                style={{ minWidth: '70px' }}
              >
                {[70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120].map((val) => (
                  <option key={val} value={val}>{val}kg</option>
                ))}
              </select>
            </div>

            {/* Time Period Selectors */}
            <div className="flex gap-1">
              {[7, 30, 60, 90].map((period) => (
                <button
                  key={period}
                  onClick={() => setWeightTimePeriod(period as 7 | 30 | 60 | 90)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    weightTimePeriod === period
                      ? 'bg-mm-blue text-white'
                      : 'bg-mm-dark2 text-mm-gray hover:bg-mm-gray/20'
                  }`}
                >
                  {period}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Line Toggles */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-mm-gray">Trend Lines:</span>
          <button
            onClick={() => setShowLinearTrend(!showLinearTrend)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showLinearTrend
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-mm-dark2 text-mm-gray hover:bg-mm-gray/20 border border-mm-gray/20'
            }`}
          >
            Linear Regression
          </button>
          <button
            onClick={() => setShowMovingAverage(!showMovingAverage)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showMovingAverage
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-mm-dark2 text-mm-gray hover:bg-mm-gray/20 border border-mm-gray/20'
            }`}
          >
            Smoothed Average
          </button>
        </div>

        {analyticsData.weightData.length > 0 ? (
          <div style={{ width: '100%', height: '400px' }} key={`${weightScaleMin}-${weightScaleMax}`}>
            <ResponsiveContainer>
              {(() => {
                const chartData = analyticsData.weightData.map(item => ({
                  ...item,
                  timestamp: new Date(item.date + 'T12:00:00').getTime()
                }));

                // Calculate trend lines
                const linearTrendData = showLinearTrend ? calculateLinearTrend(chartData) : [];
                const movingAvgWindow = Math.max(3, Math.floor(chartData.length / 10)); // Dynamic window size
                const movingAvgData = showMovingAverage ? calculateMovingAverage(chartData, movingAvgWindow) : [];

                // Merge trend data into chart data
                const mergedData = chartData.map((item, index) => ({
                  ...item,
                  trend: linearTrendData[index]?.trend,
                  movingAvg: movingAvgData[index]?.movingAvg
                }));

                return (
                  <LineChart data={mergedData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a2a"
                  horizontalCoordinatesGenerator={(props) => {
                    const { yAxis } = props;
                    if (!yAxis) return [];

                    const lines = [];
                    // Add faint lines every 1kg across the selected range
                    for (let i = weightScaleMin; i <= weightScaleMax; i++) {
                      if (yAxis.scale) {
                        lines.push(yAxis.scale(i));
                      }
                    }
                    return lines;
                  }}
                />
                {/* Additional fine grid lines for 1kg increments */}
                <CartesianGrid
                  strokeDasharray="1 1"
                  stroke="#1a1a1a"
                  strokeOpacity={0.3}
                  verticalCoordinatesGenerator={() => []}
                  horizontalCoordinatesGenerator={(props) => {
                    const { yAxis } = props;
                    if (!yAxis) return [];

                    const lines = [];
                    // Add very faint lines every 1kg (excluding 5kg marks which are handled by main grid)
                    for (let i = weightScaleMin; i <= weightScaleMax; i++) {
                      if (i % 5 !== 0 && yAxis.scale) {
                        lines.push(yAxis.scale(i));
                      }
                    }
                    return lines;
                  }}
                />
                {/* Prominent reference lines at midpoints */}
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="#00A1FE"
                  strokeOpacity={0.6}
                  verticalCoordinatesGenerator={() => []}
                  horizontalCoordinatesGenerator={(props) => {
                    const { yAxis } = props;
                    if (!yAxis) return [];

                    const lines: number[] = [];
                    const range = weightScaleMax - weightScaleMin;
                    const mid1 = Math.round(weightScaleMin + range / 3);
                    const mid2 = Math.round(weightScaleMin + (2 * range) / 3);

                    [mid1, mid2].forEach(weight => {
                      if (yAxis.scale && weight > weightScaleMin && weight < weightScaleMax) {
                        lines.push(yAxis.scale(weight));
                      }
                    });
                    return lines;
                  }}
                />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  stroke="#ababab"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis
                  stroke="#ababab"
                  fontSize={12}
                  domain={[weightScaleMin, weightScaleMax]}
                  allowDataOverflow={false}
                  ticks={(() => {
                    const range = weightScaleMax - weightScaleMin;
                    if (range <= 10) {
                      // Show every kg for small ranges
                      return Array.from({ length: range + 1 }, (_, i) => weightScaleMin + i);
                    } else if (range <= 20) {
                      // Show every 5kg for medium ranges
                      const ticks = [];
                      for (let i = weightScaleMin; i <= weightScaleMax; i += 5) {
                        ticks.push(i);
                      }
                      if (ticks[ticks.length - 1] !== weightScaleMax) ticks.push(weightScaleMax);
                      return ticks;
                    } else {
                      // Show every 10kg for large ranges
                      const ticks = [];
                      for (let i = Math.ceil(weightScaleMin / 10) * 10; i <= weightScaleMax; i += 10) {
                        ticks.push(i);
                      }
                      if (!ticks.includes(weightScaleMin)) ticks.unshift(weightScaleMin);
                      if (!ticks.includes(weightScaleMax)) ticks.push(weightScaleMax);
                      return ticks;
                    }
                  })()}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [`${value}kg`, 'Weight']}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#00A1FE"
                  strokeWidth={3}
                  dot={{ fill: '#00A1FE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00A1FE', strokeWidth: 2 }}
                  connectNulls={false}
                />
                {showLinearTrend && (
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    name="Linear Trend"
                  />
                )}
                {showMovingAverage && (
                  <Line
                    type="monotone"
                    dataKey="movingAvg"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    name="Moving Average"
                  />
                )}
              </LineChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-mm-gray">No weight data recorded yet</p>
            <p className="text-sm text-mm-gray mt-1">Start logging your weight in the Daily Tracker</p>
          </div>
        )}
      </div>

      {/* Calorie Balance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card-mm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-heading text-mm-white">Calorie Balance</h2>
                <p className="text-sm text-mm-gray">Daily deficit/surplus trends</p>
              </div>
            </div>
            
            <div className="flex gap-1">
              {[7, 30, 90].map((period) => (
                <button
                  key={period}
                  onClick={() => setCalorieBalancePeriod(period as 7 | 30 | 90)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    calorieBalancePeriod === period
                      ? 'bg-mm-blue text-white'
                      : 'bg-mm-dark2 text-mm-gray hover:bg-mm-gray/20'
                  }`}
                >
                  {period}d
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={analyticsData.calorieBalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis 
                  dataKey="label" 
                  stroke="#ababab"
                  fontSize={10}
                />
                <YAxis stroke="#ababab" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f1f1f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [
                    `${Math.abs(Number(value))} cal ${Number(value) >= 0 ? 'deficit' : 'surplus'}`,
                    'Balance'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#00A1FE"
                  fill="#00A1FE"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-mm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <BriefcaseIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Deep Work Consistency</h2>
              <p className="text-sm text-mm-gray">Last {calorieBalancePeriod} days</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-mm-gray">Completion Rate</span>
              <span className="text-purple-500 font-semibold">{deepWorkConsistency()}%</span>
            </div>
            <div className="w-full bg-mm-dark2 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deepWorkConsistency()}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {analyticsData.deepWorkData.slice(-21).map((day, index) => (
              <div
                key={index}
                className={`h-8 rounded flex items-center justify-center text-xs ${
                  day.completed ? 'bg-purple-500 text-white' : 'bg-mm-dark2 text-mm-gray'
                }`}
                title={`${day.label}: ${day.completed ? 'Completed' : 'Not completed'}`}
              >
                {day.completed ? '✓' : '○'}
              </div>
            ))}
          </div>
          <p className="text-xs text-mm-gray mt-2 text-center">Last 21 days</p>
        </div>
      </div>

      {/* MIT Performance Analytics */}
      <div className="card-mm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <ClipboardDocumentListIcon className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-heading text-mm-white">Most Important Tasks Performance</h2>
            <p className="text-sm text-mm-gray">Track your success at completing daily priorities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Overall Stats */}
          <div className="bg-mm-dark2 rounded-lg p-4">
            <h3 className="text-sm font-heading text-mm-gray mb-3">Overall Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-mm-gray">Success Rate</span>
                <span className="font-semibold text-yellow-500">{mitOverallCompletion()}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mm-gray">Perfect Days</span>
                <span className="font-semibold text-mm-white">{analyticsData.mitData.filter(d => d.total > 0 && d.completionRate === 100).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mm-gray">Current Streak</span>
                <span className="font-semibold text-green-500">{mitStreak()} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mm-gray">Avg MITs/Day</span>
                <span className="font-semibold text-mm-white">{averageMITsPerDay()}</span>
              </div>
            </div>
          </div>

          {/* Daily Completion Chart */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-heading text-mm-gray mb-3">Daily Completion Rate</h3>
            {analyticsData.mitData.filter(d => d.total > 0).length > 0 ? (
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <AreaChart data={analyticsData.mitData.filter(d => d.total > 0).slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#ababab"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#ababab" 
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value, name, props) => [
                        `${props.payload.completed}/${props.payload.total} completed (${value}%)`,
                        'MIT Success Rate'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="completionRate"
                      stroke="#eab308"
                      fill="#eab308"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No MIT data available yet</p>
                <p className="text-sm text-mm-gray mt-1">Start planning MITs to see your performance</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Calendar Grid */}
        <div>
          <h3 className="text-sm font-heading text-mm-gray mb-3">MIT Completion Heatmap (Last 21 Days)</h3>
          <div className="grid grid-cols-7 gap-2">
            {analyticsData.mitData.slice(-21).map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded flex flex-col items-center justify-center text-xs p-1 transition-all hover:scale-105 ${
                  day.total === 0 
                    ? 'bg-mm-dark2 text-mm-gray' 
                    : day.completionRate === 100
                    ? 'bg-green-500 text-white'
                    : day.completionRate >= 75
                    ? 'bg-yellow-500 text-white'
                    : day.completionRate >= 50
                    ? 'bg-orange-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
                title={`${day.label}: ${day.total > 0 ? `${day.completed}/${day.total} MITs completed (${day.completionRate}%)` : 'No MITs planned'}`}
              >
                {day.total > 0 ? (
                  <>
                    <span className="font-bold">{day.completed}</span>
                    <span className="text-xs opacity-75">/{day.total}</span>
                  </>
                ) : (
                  <span className="opacity-50">-</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-mm-gray">
            <span>No MITs</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>&lt;50%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>50-74%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>75-99%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Injection Frequency & Macro Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card-mm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <BeakerIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Injection Frequency</h2>
              <p className="text-sm text-mm-gray">Last 90 days</p>
            </div>
          </div>

          {analyticsData.injectionData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.injectionData.map((injection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                  <div>
                    <p className="font-semibold text-mm-white">{injection.compound}</p>
                    <p className="text-xs text-mm-gray">Last: {injection.lastInjection}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-heading text-orange-500">{injection.count}</p>
                    <p className="text-xs text-mm-gray">injections</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mm-gray">No injection data found</p>
              <p className="text-sm text-mm-gray mt-1">Track injections to see patterns</p>
            </div>
          )}
        </div>

        <div className="card-mm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Macro Trends</h2>
              <p className="text-sm text-mm-gray">Last 30 days average</p>
            </div>
          </div>

          {analyticsData.macroTrends.length > 0 ? (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer>
                <BarChart data={analyticsData.macroTrends.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="label" stroke="#ababab" fontSize={10} />
                  <YAxis stroke="#ababab" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f1f1f',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="protein" fill="#3b82f6" name="Protein (g)" />
                  <Bar dataKey="carbs" fill="#f97316" name="Carbs (g)" />
                  <Bar dataKey="fat" fill="#eab308" name="Fat (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mm-gray">No macro data available</p>
              <p className="text-sm text-mm-gray mt-1">Start tracking food to see trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Nirvana Life Training Analytics */}
      <div className="mb-8">
        <div className="card-mm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-heading text-mm-white">Nirvana Life Training Analytics</h2>
              <p className="text-sm text-mm-gray">Comprehensive view of your mobility and gymnastics journey</p>
            </div>
          </div>

          {/* Streak and Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-mm-dark2 rounded-lg p-4 text-center">
              <p className="text-2xl font-heading text-purple-500">{analyticsData.nirvanaData.streakData.currentStreak}</p>
              <p className="text-xs text-mm-gray">Current Streak</p>
            </div>
            <div className="bg-mm-dark2 rounded-lg p-4 text-center">
              <p className="text-2xl font-heading text-blue-500">{analyticsData.nirvanaData.streakData.longestStreak}</p>
              <p className="text-xs text-mm-gray">Longest Streak</p>
            </div>
            <div className="bg-mm-dark2 rounded-lg p-4 text-center">
              <p className="text-2xl font-heading text-green-500">{analyticsData.nirvanaData.streakData.activeDays}</p>
              <p className="text-xs text-mm-gray">Active Days (90d)</p>
            </div>
            <div className="bg-mm-dark2 rounded-lg p-4 text-center">
              <p className="text-2xl font-heading text-orange-500">{analyticsData.nirvanaData.streakData.totalSessions}</p>
              <p className="text-xs text-mm-gray">Total Sessions</p>
            </div>
          </div>

          {/* Sessions Over Time Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-heading text-mm-white mb-4">Daily Session Activity (Last 30 Days)</h3>
            {analyticsData.nirvanaData.sessionsOverTime.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <AreaChart data={analyticsData.nirvanaData.sessionsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#ababab"
                      fontSize={10}
                    />
                    <YAxis stroke="#ababab" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value) => [value, 'Sessions']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No session data available yet</p>
                <p className="text-sm text-mm-gray mt-1">Start tracking sessions to see your progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Type Frequency & Weekly Consistency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card-mm p-6">
            <h3 className="text-lg font-heading text-mm-white mb-4">Session Type Popularity</h3>
            {analyticsData.nirvanaData.sessionTypeFrequency.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.nirvanaData.sessionTypeFrequency.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-mm-white truncate">{item.sessionType}</p>
                      <div className="w-full bg-mm-dark2 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-purple-500">{item.count}</p>
                      <p className="text-xs text-mm-gray">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No session types tracked yet</p>
              </div>
            )}
          </div>

          <div className="card-mm p-6">
            <h3 className="text-lg font-heading text-mm-white mb-4">Weekly Consistency (Last 12 Weeks)</h3>
            {analyticsData.nirvanaData.weeklyConsistency.length > 0 ? (
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={analyticsData.nirvanaData.weeklyConsistency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="week" stroke="#ababab" fontSize={10} />
                    <YAxis stroke="#ababab" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value) => [value, 'Sessions']}
                    />
                    <Bar dataKey="sessions" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No weekly data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Breakdown & Daily Averages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-mm p-6">
            <h3 className="text-lg font-heading text-mm-white mb-4">Monthly Summary (Last 6 Months)</h3>
            {analyticsData.nirvanaData.monthlyBreakdown.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.nirvanaData.monthlyBreakdown.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-mm-dark2 rounded-lg">
                    <div>
                      <p className="font-semibold text-mm-white">{month.month}</p>
                      <p className="text-xs text-mm-gray">Top: {month.topType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-heading text-purple-500">{month.sessions}</p>
                      <p className="text-xs text-mm-gray">sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No monthly data available yet</p>
              </div>
            )}
          </div>

          <div className="card-mm p-6">
            <h3 className="text-lg font-heading text-mm-white mb-4">Best Training Days</h3>
            {analyticsData.nirvanaData.dailyAverages.length > 0 ? (
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <BarChart data={analyticsData.nirvanaData.dailyAverages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="dayName" 
                      stroke="#ababab" 
                      fontSize={10}
                      tick={{ textAnchor: 'middle' }}
                      angle={-45}
                      height={60}
                    />
                    <YAxis stroke="#ababab" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value, name, props) => [
                        `${value} avg (${props.payload.total} total)`,
                        'Sessions per day'
                      ]}
                    />
                    <Bar dataKey="average" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-mm-gray">No daily pattern data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Part Focus Heat Map */}
      <div className="card-mm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-heading text-mm-white">Body Part Focus Heat Map</h2>
            <p className="text-sm text-mm-gray">Training frequency by body part (last 30 days)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Body Diagram */}
          <div className="relative">
            <div className="bg-mm-dark2 rounded-lg p-6 min-h-[400px] relative overflow-hidden">
              <h3 className="text-lg font-heading text-mm-white mb-4 text-center">Training Heat Map</h3>
              
              {/* Simple body outline using CSS */}
              <div className="relative mx-auto w-32 h-80 flex flex-col items-center">
                {/* Head */}
                <div className="w-12 h-12 rounded-full border-2 border-mm-gray/30 mb-2"></div>
                
                {/* Body sections with heat map overlay */}
                <div className="relative w-24 h-64 border-2 border-mm-gray/30 rounded-lg">
                  {analyticsData.bodyPartUsage.map((bodyPart) => {
                    const maxSessions = Math.max(...analyticsData.bodyPartUsage.map(bp => bp.sessionCount));
                    const intensity = maxSessions > 0 ? (bodyPart.sessionCount / maxSessions) : 0;
                    const heatColor = intensity > 0 
                      ? `rgba(255, 161, 22, ${Math.min(0.8, intensity * 0.8 + 0.2)})` 
                      : 'transparent';
                    
                    return (
                      <div
                        key={bodyPart.bodyPartId}
                        className="absolute rounded-full border border-orange-500/50 flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:scale-110 transition-all"
                        style={{
                          left: `${bodyPart.position.x - 10}%`,
                          top: `${bodyPart.position.y - 10}%`,
                          width: '20px',
                          height: '20px',
                          backgroundColor: heatColor,
                          boxShadow: intensity > 0 ? `0 0 10px ${heatColor}` : 'none'
                        }}
                        title={`${bodyPart.name}: ${bodyPart.sessionCount} sessions`}
                      >
                        {bodyPart.sessionCount > 0 ? bodyPart.sessionCount : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-xs text-mm-gray">
                  <span>Less trained</span>
                  <div className="flex items-center gap-1">
                    {[0.2, 0.4, 0.6, 0.8].map((opacity, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded border border-orange-500/50"
                        style={{ backgroundColor: `rgba(255, 161, 22, ${opacity})` }}
                      />
                    ))}
                  </div>
                  <span>More trained</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Part Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading text-mm-white mb-4">Training Statistics</h3>
            
            {analyticsData.bodyPartUsage
              .sort((a, b) => b.sessionCount - a.sessionCount)
              .map((bodyPart) => {
                const maxSessions = Math.max(...analyticsData.bodyPartUsage.map(bp => bp.sessionCount));
                const percentage = maxSessions > 0 ? (bodyPart.sessionCount / maxSessions) * 100 : 0;
                
                return (
                  <div key={bodyPart.bodyPartId} className="bg-mm-dark2 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          bodyPart.category === 'upper' ? 'bg-blue-500/20 text-blue-400' :
                          bodyPart.category === 'core' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {bodyPart.category}
                        </span>
                        <h4 className="font-heading text-mm-white">{bodyPart.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-heading text-orange-500">{bodyPart.sessionCount}</div>
                        <div className="text-xs text-mm-gray">sessions</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-mm-dark rounded-full h-2 mb-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-mm-gray">
                      <span>
                        Intensity: {bodyPart.averageIntensity > 0 ? bodyPart.averageIntensity.toFixed(1) : 'N/A'}
                      </span>
                      <span>
                        {bodyPart.lastTrained 
                          ? `Last: ${new Date(bodyPart.lastTrained).toLocaleDateString()}`
                          : 'Never trained'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            
            {analyticsData.bodyPartUsage.every(bp => bp.sessionCount === 0) && (
              <div className="text-center py-8 text-mm-gray">
                <p>No training data available yet</p>
                <p className="text-sm mt-2">Start logging Nirvana sessions to see your body part focus</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Correlation Insights */}
      <div className="card-mm p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <LightBulbIcon className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-heading text-mm-white">Training Insights & Patterns</h2>
            <p className="text-sm text-mm-gray">Discover what session combinations work best for you</p>
          </div>
          <span className="ml-auto text-xs text-mm-gray bg-cyan-500/10 px-3 py-1 rounded-full">
            {analyticsData.correlationAnalysis.insights.length} insights found
          </span>
        </div>

        {analyticsData.correlationAnalysis.insights.length > 0 || analyticsData.correlationAnalysis.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Training Insights */}
            <div>
              <h3 className="text-lg font-heading text-mm-white mb-4">Your Training Patterns</h3>
              <div className="space-y-4">
                {analyticsData.correlationAnalysis.insights.map((insight) => {
                  const getInsightIcon = (type: string) => {
                    switch (type) {
                      case 'preparation': return '🏃‍♂️';
                      case 'combination': return '🤝';
                      case 'sequence': return '📈';
                      case 'recovery': return '😌';
                      default: return '💡';
                    }
                  };

                  const getInsightColor = (confidence: number) => {
                    if (confidence > 0.8) return 'border-green-500/30 bg-green-500/10';
                    if (confidence > 0.6) return 'border-cyan-500/30 bg-cyan-500/10';
                    return 'border-yellow-500/30 bg-yellow-500/10';
                  };

                  return (
                    <div
                      key={insight.id}
                      className={`rounded-lg border p-4 ${getInsightColor(insight.confidence)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-heading text-mm-white">{insight.title}</h4>
                            <span className="text-xs px-2 py-1 bg-mm-dark2 rounded-full text-mm-gray">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-mm-gray mb-3">{insight.description}</p>
                          <div className="flex items-center gap-2">
                            {insight.sessions.map((session, index) => (
                              <div key={session} className="flex items-center">
                                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                                  {session}
                                </span>
                                {index < insight.sessions.length - 1 && (
                                  <ArrowRightIcon className="w-3 h-3 text-mm-gray mx-2" />
                                )}
                              </div>
                            ))}
                          </div>
                          {insight.timingRecommendation && (
                            <div className="mt-2 text-xs text-cyan-400">
                              ⏱️ Best timing: {insight.timingRecommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-heading text-mm-white mb-4">Training Recommendations</h3>
              <div className="space-y-3">
                {analyticsData.correlationAnalysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="bg-mm-dark2 rounded-lg p-4 border border-cyan-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-cyan-400">{index + 1}</span>
                      </div>
                      <p className="text-sm text-mm-white">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Correlations */}
              {analyticsData.correlationAnalysis.correlations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-heading text-mm-white mb-3">Strongest Session Pairs</h4>
                  <div className="space-y-2">
                    {analyticsData.correlationAnalysis.correlations
                      .slice(0, 5)
                      .map((correlation, index) => (
                        <div
                          key={index}
                          className="bg-mm-dark2 rounded-lg p-3 border border-mm-gray/20"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-cyan-400">#{index + 1}</span>
                              <span className="text-xs text-mm-white truncate">
                                {correlation.sessionA} + {correlation.sessionB}
                              </span>
                            </div>
                            <span className="text-xs text-cyan-400">
                              {Math.round(correlation.successRate * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-mm-gray">
                            <span>Same day: {correlation.sameDayCount}</span>
                            <span>Sequence: {correlation.sequenceCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-mm-gray">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <LightBulbIcon className="w-8 h-8 text-cyan-500/50" />
            </div>
            <p className="text-lg font-heading mb-2">Not enough data yet</p>
            <p className="text-sm">Keep logging your Nirvana sessions to discover training patterns and correlations.</p>
            <p className="text-sm mt-2">We need at least 10+ sessions to generate meaningful insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}