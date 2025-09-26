import { useState, useEffect } from 'react';
import { 
  LeaderboardEntry, 
  UserLeaderboardStats, 
  getLeaderboardWithRealUser,
  recordQuizCompletion,
  QuizCompletionResult
} from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing leaderboard data with real user stats
 */
export function useLeaderboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [alltimeLeaderboard, setAlltimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserLeaderboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load real data for weekly and all-time leaderboards
      const [weeklyData, alltimeData] = await Promise.all([
        getLeaderboardWithRealUser(user.id, 'weekly'),
        getLeaderboardWithRealUser(user.id, 'alltime')
      ]);

      setWeeklyLeaderboard(weeklyData.leaderboard);
      setAlltimeLeaderboard(alltimeData.leaderboard);
      setUserStats(weeklyData.userStats || alltimeData.userStats);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard data';
      setError(errorMessage);
      console.error('Error loading leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [user?.id]);

  return {
    weeklyLeaderboard,
    alltimeLeaderboard,
    userStats,
    loading,
    error,
    refetch: loadLeaderboardData
  };
}

/**
 * Hook for handling quiz completion with points calculation
 */
export function useQuizCompletion() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<QuizCompletionResult | null>(null);

  const submitQuizCompletion = async (
    quizId: number,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    timeTaken: number
  ): Promise<QuizCompletionResult | null> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setSubmitting(true);
    try {
      const result = await recordQuizCompletion(
        user.id,
        quizId,
        score,
        correctAnswers,
        totalQuestions,
        timeTaken
      );
      
      setLastResult(result);
      return result;
    } catch (error) {
      console.error('Quiz completion error:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitQuizCompletion,
    submitting,
    lastResult,
    clearLastResult: () => setLastResult(null)
  };
}