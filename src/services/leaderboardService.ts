// =====================================================
// LEADERBOARD SERVICE - REAL DATA INTEGRATION
// =====================================================

import { supabase } from './supabaseClient';

// Types for the leaderboard system
export interface LeaderboardEntry {
  rank_position: number;
  user_id: string;
  user_name: string;
  avatar_url: string;
  total_points?: number;
  weekly_points?: number;
  is_current_user: boolean;
}

export interface UserLeaderboardStats {
  total_points: number;
  weekly_points: number;
  alltime_rank: number;
  weekly_rank: number;
  total_users_count: number;
  weekly_users_count: number;
}

export interface QuizCompletionResult {
  points_earned: number;
  speed_bonus: number;
  perfect_bonus: number;
  total_user_points: number;
  weekly_user_points: number;
}

/**
 * Get user's real leaderboard statistics
 * Note: Advanced Supabase functions not yet deployed, using fallback method
 */
export async function getUserLeaderboardStats(userId: string): Promise<UserLeaderboardStats | null> {
  // For now, the advanced leaderboard functions aren't deployed yet
  // We'll use the fallback method directly
  return null;
}

/**
 * Get real user points from home_marks_of_user table
 * This is a fallback if the leaderboard functions aren't set up yet
 */
export async function getUserPointsFromQuizzes(userId: string): Promise<{
  totalPoints: number;
  weeklyPoints: number;
  completedQuizzes: number;
} | null> {
  try {
    // Get current week start date (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6 days back
    currentWeekStart.setDate(now.getDate() - daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get all quiz results for the user
    const { data: quizResults, error } = await supabase
      .from('home_marks_of_user')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      console.error('Error fetching quiz results:', error);
      return null;
    }


    if (!quizResults || quizResults.length === 0) {
      return {
        totalPoints: 0,
        weeklyPoints: 0,
        completedQuizzes: 0
      };
    }

    // Calculate points from quiz scores
    let totalPoints = 0;
    let weeklyPoints = 0;
    const completedQuizzes = quizResults.length;
    let weeklyQuizCount = 0;


    quizResults.forEach((result, index) => {
      // Fixed 15 XP per successfully completed quiz (≥70%)
      let points = 0;
      
      if ((result as any).completed) {
        points = 15; // Fixed 15 XP for successful completion
      }

      totalPoints += points;

      // Check if this quiz was completed this week
      const completedAt = new Date((result as any).completed_at || (result as any).updated_at);
      
      if (completedAt >= currentWeekStart) {
        weeklyPoints += points;
        weeklyQuizCount++;
      }
    });


    return {
      totalPoints,
      weeklyPoints,
      completedQuizzes
    };

  } catch (error) {
    console.error('Error in getUserPointsFromQuizzes:', error);
    return null;
  }
}

/**
 * Initialize user in points system if not exists
 * Note: Advanced functions not deployed yet, this is a placeholder
 */
export async function initializeUserPoints(userId: string): Promise<void> {
  // Advanced points system functions not deployed yet
  // User initialization will happen when the full system is deployed
}

/**
 * Record quiz completion with points calculation
 * Note: Advanced functions not deployed yet, using existing quiz submission
 */
export async function recordQuizCompletion(
  userId: string,
  quizId: number,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  timeTaken: number,
  completed: boolean = true
): Promise<QuizCompletionResult | null> {
  try {
    // For now, we'll calculate points manually since the advanced functions aren't deployed
    const basePoints = correctAnswers * 10;
    
    // Basic quiz recording (using existing structure)
    const { error } = await supabase
      .from('home_marks_of_user')
      .upsert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        completed: completed,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any);

    if (error) {
      console.error('Error recording quiz completion:', error);
      return null;
    }

    return {
      points_earned: basePoints,
      speed_bonus: 0, // Will be implemented when advanced system is deployed
      perfect_bonus: score === 1.0 ? 20 : 0, // Basic perfect bonus
      total_user_points: 0, // Will be calculated in real-time
      weekly_user_points: 0 // Will be calculated in real-time
    };
  } catch (error) {
    console.error('Error in recordQuizCompletion:', error);
    return null;
  }
}

/**
 * Get leaderboard with real user data and mock other users
 */
// New leaderboard types for university rankings
export interface UserLeaderboardRow {
  rank_position: number;
  user_id: string;
  user_name: string;
  university_name?: string;
  total_xp: number;
  avatar_url?: string;
}

export interface UniversityLeaderboardRow {
  rank_position: number;
  university_name: string;
  total_xp: number;
  students_count: number;
  logo_url?: string;
}

/**
 * Get users leaderboard (all-time)
 */
export async function getUsersAllTime(limit: number = 100): Promise<UserLeaderboardRow[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard_users_all_time')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching users leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUsersAllTime:', error);
    return [];
  }
}

/**
 * Get universities leaderboard (all-time)
 * Now shows ALL universities, including those with 0 XP
 */
export async function getUniversitiesAllTime(limit: number = 1000): Promise<UniversityLeaderboardRow[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard_universities_all_time')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching universities leaderboard:', error);
      return [];
    }

    // Ensure we have proper data structure with 0 values for missing fields
    // Also filter out "Alta Universitate" client-side as backup
    const sanitizedData = (data || [])
      .filter(university => 
        (university as any).university_name && 
        !(university as any).university_name.toLowerCase().includes('altă universitate')
      )
      .map(university => ({
        ...(university as any),
        total_xp: (university as any).total_xp || 0,
        students_count: (university as any).students_count || 0,
      }));

    return sanitizedData;
  } catch (error) {
    console.error('Error in getUniversitiesAllTime:', error);
    return [];
  }
}

/**
 * Get universities leaderboard (this week)
 * Now shows ALL universities, including those with 0 weekly XP
 */
export async function getUniversitiesThisWeek(limit: number = 1000): Promise<UniversityLeaderboardRow[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard_universities_week')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching weekly universities leaderboard:', error);
      return [];
    }

    // Ensure we have proper data structure with 0 values for missing fields
    // Also filter out "Alta Universitate" client-side as backup
    const sanitizedData = (data || [])
      .filter(university => 
        (university as any).university_name && 
        !(university as any).university_name.toLowerCase().includes('altă universitate')
      )
      .map(university => ({
        ...(university as any),
        total_xp: (university as any).total_xp || 0,
        students_count: (university as any).students_count || 0,
      }));

    return sanitizedData;
  } catch (error) {
    console.error('Error in getUniversitiesThisWeek:', error);
    return [];
  }
}

export async function getLeaderboardWithRealUser(
  currentUserId: string,
  type: 'weekly' | 'alltime' = 'weekly'
): Promise<{
  leaderboard: LeaderboardEntry[];
  userStats: UserLeaderboardStats | null;
}> {
  try {
    // Note: Advanced points system functions not deployed yet
    // Using direct database calculation instead
    
    // Try to get real user stats (will return null since functions aren't deployed)
    let userStats = await getUserLeaderboardStats(currentUserId);
    
    // If leaderboard functions don't exist yet, use fallback
    if (!userStats) {
      const fallbackStats = await getUserPointsFromQuizzes(currentUserId);
      if (fallbackStats) {
        // Calculate real rank based on points vs mock users
        const weeklyPoints = fallbackStats.weeklyPoints;
        const totalPoints = fallbackStats.totalPoints;
        
        // Mock weekly leaderboard points for comparison (more realistic)
        const mockWeeklyPoints = [120, 105, 90]; // Top 3 mock users (15 XP per completed quiz)
        // Mock all-time leaderboard points for comparison  
        const mockAlltimePoints = [450, 375, 315]; // Top 3 mock users (15 XP per completed quiz)
        
        // Calculate real weekly rank
        let weeklyRank = 1;
        mockWeeklyPoints.forEach(points => {
          if (weeklyPoints < points) weeklyRank++;
        });
        
        // Calculate real all-time rank
        let alltimeRank = 1;
        mockAlltimePoints.forEach(points => {
          if (totalPoints < points) alltimeRank++;
        });
        
        
        userStats = {
          total_points: fallbackStats.totalPoints,
          weekly_points: fallbackStats.weeklyPoints,
          alltime_rank: alltimeRank,
          weekly_rank: weeklyRank,
          total_users_count: 100,
          weekly_users_count: 80
        };
      } else {
        userStats = {
          total_points: 0,
          weekly_points: 0,
          alltime_rank: 0,
          weekly_rank: 0,
          total_users_count: 0,
          weekly_users_count: 0
        };
      }
    }

    // Create mock leaderboard entries (realistic points)
    const mockUsers: LeaderboardEntry[] = [
      {
        rank_position: 1, // Will be adjusted
        user_id: 'mock-1',
        user_name: 'Andra Gheorghe',
        avatar_url: '',
        weekly_points: type === 'weekly' ? 120 : undefined, // 12 correct answers this week
        total_points: type === 'alltime' ? 450 : undefined, // ~45 total correct answers
        is_current_user: false,
      },
      {
        rank_position: 2, // Will be adjusted
        user_id: 'mock-2',
        user_name: 'Mihai Cristea',
        avatar_url: '',
        weekly_points: type === 'weekly' ? 100 : undefined, // 10 correct answers this week
        total_points: type === 'alltime' ? 380 : undefined, // ~38 total correct answers
        is_current_user: false,
      },
      {
        rank_position: 3, // Will be adjusted
        user_id: 'mock-3',
        user_name: 'Diana Moldovan',
        avatar_url: '',
        weekly_points: type === 'weekly' ? 80 : undefined, // 8 correct answers this week
        total_points: type === 'alltime' ? 320 : undefined, // ~32 total correct answers
        is_current_user: false,
      },
      {
        rank_position: 4, // Will be adjusted
        user_id: 'mock-4',
        user_name: 'Radu Stanciu',
        avatar_url: '',
        weekly_points: type === 'weekly' ? 70 : undefined, // 7 correct answers this week
        total_points: type === 'alltime' ? 290 : undefined, // ~29 total correct answers
        is_current_user: false,
      },
      {
        rank_position: 5, // Will be adjusted
        user_id: 'mock-5',
        user_name: 'Ioana Dumitrescu',
        avatar_url: '',
        weekly_points: type === 'weekly' ? 60 : undefined, // 6 correct answers this week
        total_points: type === 'alltime' ? 250 : undefined, // ~25 total correct answers
        is_current_user: false,
      },
    ];

    // Get real user data
    const userPoints = type === 'weekly' ? userStats.weekly_points : userStats.total_points;

    // Get user info from Supabase
    const { data: userData } = await supabase.auth.getUser();
    const userName = userData.user?.user_metadata?.full_name || 
                    userData.user?.user_metadata?.name || 
                    userData.user?.email || 
                    'You';

    // Create current user entry with real data
    const currentUserEntry: LeaderboardEntry = {
      rank_position: 0, // Will be calculated after sorting
      user_id: currentUserId,
      user_name: userName,
      avatar_url: userData.user?.user_metadata?.avatar_url || '',
      weekly_points: type === 'weekly' ? userPoints : undefined,
      total_points: type === 'alltime' ? userPoints : undefined,
      is_current_user: true,
    };

    // Combine all users (mock + real user)
    const allUsers = [...mockUsers, currentUserEntry];

    // Sort by points (descending)
    allUsers.sort((a, b) => {
      const aPoints = type === 'weekly' ? (a.weekly_points || 0) : (a.total_points || 0);
      const bPoints = type === 'weekly' ? (b.weekly_points || 0) : (b.total_points || 0);
      return bPoints - aPoints; // Descending order
    });

    // Assign proper rank positions
    allUsers.forEach((user, index) => {
      user.rank_position = index + 1;
    });

    // Transform to the expected format
    const leaderboard = allUsers.map(u => ({
      name: u.user_name,
      points: type === 'weekly' ? u.weekly_points : u.total_points,
      rank: u.rank_position,
      isCurrentUser: u.is_current_user
    }));

    return {
      leaderboard: allUsers,
      userStats
    };

  } catch (error) {
    console.error('Error in getLeaderboardWithRealUser:', error);
    return {
      leaderboard: [],
      userStats: null
    };
  }
}