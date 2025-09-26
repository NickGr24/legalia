import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  AchievementUnlock,
  AchievementStats,
} from '../utils/types';
import { UserStats } from '../utils/supabaseTypes';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'user_achievements';
const PROGRESS_KEY = 'achievement_progress';
const STATS_KEY = 'achievement_stats';

export class AchievementsService {
  // Get user's unlocked achievements
  async getUserAchievements(): Promise<UserAchievement[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load user achievements:', error);
      return [];
    }
  }

  // Save user achievements
  private async saveUserAchievements(achievements: UserAchievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error('Failed to save user achievements:', error);
    }
  }

  // Get achievement progress for all achievements
  async getAchievementProgress(): Promise<Record<string, AchievementProgress>> {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load achievement progress:', error);
      return {};
    }
  }

  // Save achievement progress
  private async saveAchievementProgress(progress: Record<string, AchievementProgress>): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  // Check for new achievements after quiz completion
  async checkAchievements(userStats: UserStats, quizData?: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    completionTime: number; // in seconds
  }): Promise<AchievementUnlock[]> {
    const userAchievements = await this.getUserAchievements();
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const newUnlocks: AchievementUnlock[] = [];

    // Get current progress
    const currentProgress = await this.getAchievementProgress();

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedAchievementIds.has(achievement.id)) {
        continue;
      }

      const progress = await this.calculateProgress(achievement, userStats, quizData);
      const isUnlocked = progress >= achievement.criteria.target;

      // Update progress
      currentProgress[achievement.id] = {
        achievement_id: achievement.id,
        current_progress: progress,
        target_progress: achievement.criteria.target,
        percentage: Math.min((progress / achievement.criteria.target) * 100, 100),
        unlocked: isUnlocked
      };

      // Check if newly unlocked
      if (isUnlocked) {
        const userAchievement: UserAchievement = {
          id: `${Date.now()}_${achievement.id}`,
          user_id: 'current_user', // Replace with actual user ID
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString(),
          progress: progress,
          max_progress: achievement.criteria.target,
          notified: false
        };

        userAchievements.push(userAchievement);
        newUnlocks.push({
          achievement,
          unlocked_at: new Date(),
          isNew: true
        });
      }
    }

    // Save updated data
    if (newUnlocks.length > 0) {
      await this.saveUserAchievements(userAchievements);
    }
    await this.saveAchievementProgress(currentProgress);

    return newUnlocks;
  }

  // Calculate progress for a specific achievement
  private async calculateProgress(
    achievement: Achievement, 
    userStats: UserStats, 
    quizData?: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      completionTime: number;
    }
  ): Promise<number> {
    switch (achievement.criteria.type) {
      case 'quizzes_completed':
        return userStats.completedQuizzes || 0;

      case 'perfect_scores':
        // This would need to be tracked separately in quiz results
        // For now, estimate based on average score
        const estimatedPerfects = Math.floor(((userStats.averageScore || 0) - 90) / 10) * (userStats.completedQuizzes || 0) / 10;
        return Math.max(0, estimatedPerfects);

      case 'consecutive_days':
        return userStats.streak?.current_streak || 0;

      case 'total_score':
        return (userStats.completedQuizzes || 0) * (userStats.averageScore || 0);

      case 'average_score':
        return userStats.averageScore || 0;

      case 'speed_completion':
        if (quizData && achievement.criteria.conditions) {
          const scoreCondition = achievement.criteria.conditions.find(c => c.field === 'score');
          if (scoreCondition && quizData.score > scoreCondition.value && quizData.completionTime <= achievement.criteria.target) {
            return 1; // Achievement completed
          }
        }
        return 0;

      case 'leaderboard_position':
        // This would need leaderboard data
        return 999; // Placeholder

      case 'weekly_rank':
        // This would need weekly leaderboard data
        return 999; // Placeholder

      default:
        return 0;
    }
  }

  // Get achievement statistics
  async getAchievementStats(): Promise<AchievementStats> {
    const userAchievements = await this.getUserAchievements();
    const progress = await this.getAchievementProgress();

    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedAchievements = userAchievements.length;
    const totalPoints = ACHIEVEMENTS.reduce((sum, ach) => sum + ach.points, 0);
    const earnedPoints = userAchievements.reduce((sum, ua) => {
      const achievement = ACHIEVEMENTS.find(ach => ach.id === ua.achievement_id);
      return sum + (achievement?.points || 0);
    }, 0);

    const recentUnlocks = userAchievements
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, 5);

    return {
      totalAchievements,
      unlockedAchievements,
      totalPoints,
      earnedPoints,
      completionPercentage: (unlockedAchievements / totalAchievements) * 100,
      recentUnlocks
    };
  }

  // Mark achievement as notified
  async markAsNotified(achievementId: string): Promise<void> {
    const userAchievements = await this.getUserAchievements();
    const achievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    if (achievement) {
      achievement.notified = true;
      await this.saveUserAchievements(userAchievements);
    }
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return ACHIEVEMENTS.filter(ach => ach.category === category);
  }

  // Get achievement by ID
  getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(ach => ach.id === id);
  }

  // Reset all achievements (for testing)
  async resetAchievements(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(PROGRESS_KEY);
      await AsyncStorage.removeItem(STATS_KEY);
    } catch (error) {
      console.error('Failed to reset achievements:', error);
    }
  }
}

export const achievementsService = new AchievementsService();