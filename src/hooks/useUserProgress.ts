import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import {
  UserProgress,
  UserStats,
  UserStreak,
  QuizResult,
} from '../utils/supabaseTypes';

// Hook for user progress data
export const useUserProgress = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserProgress[]>([]);

  const fetchUserProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const progress = await supabaseService.getUserProgress();
      setData(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user progress');
      console.error('❌ useUserProgress error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserProgress = useCallback(async () => {
    await fetchUserProgress();
  }, [fetchUserProgress]);

  const saveQuizProgress = useCallback(async (
    quizId: number, 
    score: number, 
    correctAnswers: number, 
    totalQuestions: number
  ): Promise<QuizResult | null> => {
    try {
      const result = await supabaseService.submitQuizResult(quizId, score, correctAnswers, totalQuestions);
      // Refresh the data to include the new progress
      await refreshUserProgress();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz progress');
      console.error('❌ saveQuizProgress error:', err);
      return null;
    }
  }, [refreshUserProgress]);

  useEffect(() => {
    fetchUserProgress();
  }, [fetchUserProgress]);

  return {
    loading,
    error,
    data,
    refreshUserProgress,
    saveQuizProgress,
  };
};

// Hook for user progress summary (now using UserStats)
export const useUserProgressSummary = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserStats | null>(null);

  const fetchProgressSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await supabaseService.getUserStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress summary');
      console.error('❌ useUserProgressSummary error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProgressSummary = useCallback(async () => {
    await fetchProgressSummary();
  }, [fetchProgressSummary]);

  useEffect(() => {
    fetchProgressSummary();
  }, [fetchProgressSummary]);

  return {
    loading,
    error,
    data,
    refreshProgressSummary,
  };
};

// Hook for discipline-specific progress
export const useUserProgressByDiscipline = (disciplineId: number) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserProgress[]>([]);

  const fetchDisciplineProgress = useCallback(async () => {
    if (!disciplineId) return;
    
    try {
      setLoading(true);
      setError(null);
      // Get all user progress and filter by discipline
      const allProgress = await supabaseService.getUserProgress();
      const disciplineQuizzes = await supabaseService.getQuizzesForDiscipline(disciplineId);
      const disciplineQuizIds = disciplineQuizzes.map(q => q.id);
      const filteredProgress = allProgress.filter(p => disciplineQuizIds.includes(p.quiz_id));
      setData(filteredProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discipline progress');
      console.error('❌ useUserProgressByDiscipline error:', err);
    } finally {
      setLoading(false);
    }
  }, [disciplineId]);

  const refreshDisciplineProgress = useCallback(async () => {
    await fetchDisciplineProgress();
  }, [fetchDisciplineProgress]);

  useEffect(() => {
    fetchDisciplineProgress();
  }, [fetchDisciplineProgress]);

  return {
    loading,
    error,
    data,
    refreshDisciplineProgress,
  };
};

// Hook for user streak
export const useUserStreak = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserStreak | null>(null);

  const fetchUserStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const streak = await supabaseService.getUserStreak();
      setData(streak);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user streak');
      console.error('❌ useUserStreak error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStreak = useCallback(async (): Promise<UserStreak | null> => {
    try {
      const result = await supabaseService.updateUserStreak();
      // Refresh streak data to get the latest information
      await fetchUserStreak();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update streak');
      console.error('❌ updateStreak error:', err);
      return null;
    }
  }, [fetchUserStreak]);

  const refreshUserStreak = useCallback(async () => {
    await fetchUserStreak();
  }, [fetchUserStreak]);

  useEffect(() => {
    fetchUserStreak();
  }, [fetchUserStreak]);

  return {
    loading,
    error,
    data,
    refreshUserStreak,
    updateStreak,
  };
};

// Combined hook for all user progress data (for HomeScreen)
export const useUserProgressData = () => {
  const progressSummary = useUserProgressSummary();
  const streak = useUserStreak();

  const loading = progressSummary.loading || streak.loading;
  const error = progressSummary.error || streak.error;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      progressSummary.refreshProgressSummary(),
      streak.refreshUserStreak(),
    ]);
  }, [progressSummary.refreshProgressSummary, streak.refreshUserStreak]);

  return {
    loading,
    error,
    progressSummary: progressSummary.data,
    streak: streak.data,
    refreshAll,
    updateStreak: streak.updateStreak,
  };
};