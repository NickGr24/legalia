import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: { refresh?: boolean } | undefined;
  DisciplineRoadmap: { disciplineId: number; disciplineName: string };
  QuizGame: { quizId: number; quizTitle: string };
  QuizResult: {
    score: number;
    totalQuestions: number;
    quizTitle: string;
    correctAnswers: number;
    incorrectAnswers?: number;
    answeredQuestions?: number;
    wasImprovement?: boolean;
    previousScore?: number;
    streakInfo?: any;
    shouldRefreshHome?: boolean;
  };
  FriendsInbox: undefined;
  FriendsList: undefined;
  FriendsLeaderboard: undefined;
  UserProfile: { userId: string; userName?: string };
};

export type TabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  Friends: undefined;
};

export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

// Optimized Quiz API Types - New Structure
export interface Answer {
  id: number;
  question_id: number;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  quiz_id: number;
  text: string;
  answers: Answer[];
}

export interface Discipline {
  id: number;
  name: string;
  description?: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  discipline_id: number;
}

export interface QuizFullData {
  id: number;
  title: string;
  description: string;
  discipline: Discipline;
  questions: Question[];
}

// Legacy Quiz API Types (deprecated - for backward compatibility)
export interface QuizApiAnswer {
  id: number;
  content: string;
  text?: string; // Fallback field
  correct?: boolean;
  is_correct?: boolean;
  isCorrect?: boolean;
  right?: boolean;
}

export interface QuizApiQuestion {
  id: number;
  content: string;
  text?: string; // Fallback field
  answers: QuizApiAnswer[];
}

export interface QuizApiBasic {
  id: number;
  title: string;
  description: string;
  discipline: number;
  slug?: string;
  question_count?: number;
  user_score?: number | null;
}

export interface QuizApiDetail {
  quiz: {
    id: number;
    title: string;
  };
  questions: QuizApiQuestion[];
}

export interface QuizWithQuestions {
  id: number;
  title: string;
  description: string;
  discipline: number;
  questions: QuizApiQuestion[];
}

// Legacy Types (kept for compatibility)
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  isLocked: boolean;
  category: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: number;
  content: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: number;
  content: string;
  correct: boolean;
}

export interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity: string;
}

// Achievement Display Types
export interface AchievementGridItem {
  achievement: Achievement;
  userAchievement: UserAchievement | null;
  progress: AchievementProgress;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercentage: number;
  recentUnlocks: UserAchievement[];
}

// Component Props Types
export interface QuizWithProgress {
  id: number;
  title: string;
  level: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  score?: number;
}

export interface DisciplineData {
  id: number;
  name: string;
  quizzes: QuizWithProgress[];
}

// Quiz Game Types
export interface QuizSession {
  quizId: number;
  quizTitle: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: UserQuizAnswer[];
  startTime: Date;
  endTime?: Date;
}

export interface UserQuizAnswer {
  questionId: number;
  selectedAnswerId: number;
  isCorrect: boolean;
}

// New API Types for User Progress and Streak
export interface UserProgress {
  id: number;
  user_id: number;
  quiz_id: number;
  quiz_title: string;
  discipline_id: number;
  discipline_name: string;
  score: number;
  completed: boolean;
  completed_at: string;
  updated_at: string;
}

export interface UserProgressSummary {
  total_quizzes_attempted: number;
  total_quizzes_completed: number;
  overall_average_score: number;
  completion_percentage: number;
  discipline_breakdown: DisciplineProgressBreakdown[];
}

export interface DisciplineProgressBreakdown {
  quiz__discipline__name: string;
  quiz__discipline__id: number;
  total_quizzes: number;
  completed_quizzes: number;
  avg_score: number;
}

// Updated UserStreak type to match API
export interface ApiUserStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  user_timezone?: string;
  user_today?: string;
  quiz_completed_today?: boolean;
}

// Legacy type - now using UserStreak from supabaseTypes
export interface StreakUpdateResponse {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  streak_updated: boolean;
}

export interface QuizSubmissionResult {
  score: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  results: Array<{
    question_id: number;
    question: string;
    user_answer_id: number;
    user_answer: string;
    correct_answer_id: number;
    correct_answer: string;
    is_correct: boolean;
  }>;
  streak_info?: StreakUpdateResponse;
}

// Achievement System Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  criteria: AchievementCriteria;
  rarity: AchievementRarity;
  points: number;
  hidden: boolean;
}

export type AchievementCategory = 
  | 'quiz_progress' 
  | 'perfect_scores' 
  | 'speed_bonuses' 
  | 'streaks' 
  | 'scoring_milestones' 
  | 'leaderboard';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementCriteria {
  type: CriteriaType;
  target: number;
  conditions?: AchievementCondition[];
}

export type CriteriaType = 
  | 'quizzes_completed'
  | 'perfect_scores'
  | 'consecutive_days'
  | 'total_score'
  | 'average_score'
  | 'speed_completion'
  | 'leaderboard_position'
  | 'weekly_rank'
  | 'monthly_rank';

export interface AchievementCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
  notified: boolean;
}

export interface AchievementProgress {
  achievement_id: string;
  current_progress: number;
  target_progress: number;
  percentage: number;
  unlocked: boolean;
}

export interface AchievementUnlock {
  achievement: Achievement;
  unlocked_at: Date;
  isNew: boolean;
}

// Friendship System Types
export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
  // Enriched with user profile data
  requester?: UserProfile;
  addressee?: UserProfile;
}

export interface Friend {
  friendship_id: string;
  user_id: string;
  username: string;
  email: string;
  profile?: UserProfile;
  mutual_friends_count?: number;
  friend_since: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  total_score?: number;
  total_quizzes_completed?: number;
  current_streak?: number;
}

export interface FriendsLeaderboardEntry {
  user_id: string;
  username: string;
  email: string;
  total_score: number;
  total_quizzes_completed: number;
  current_streak: number;
  rank: number;
  is_current_user: boolean;
  profile?: UserProfile;
}

export interface FriendshipStats {
  total_friends: number;
  pending_incoming: number;
  pending_outgoing: number;
  mutual_friends?: number;
}