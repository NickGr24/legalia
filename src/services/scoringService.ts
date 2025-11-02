/**
 * UNIFIED SCORING SERVICE
 * Single source of truth for all XP/points/score calculations
 * Follows canonical JavaScript-only implementation
 */

import { logger } from '../utils/logger';

// Constants for scoring system
export const SCORING_CONSTANTS = {
  // Base XP per completed quiz (≥70% score)
  BASE_XP_PER_COMPLETED_QUIZ: 15,
  
  // Minimum score percentage to consider quiz completed
  COMPLETION_THRESHOLD: 70,
  
  // Bonus XP for perfect score (100%)
  PERFECT_SCORE_BONUS: 5,
  
  // Bonus XP for speed completion (under 30 seconds per question)
  SPEED_BONUS: 3,
  
  // Bonus XP for streak maintenance
  STREAK_BONUS: {
    WEEK_STREAK: 5,    // 7 days
    MONTH_STREAK: 10,  // 30 days
    YEAR_STREAK: 20    // 365 days
  }
};

export interface QuizScoreResult {
  score: number;           // Percentage score (0-100)
  xpEarned: number;        // Total XP earned from this quiz
  isCompleted: boolean;    // Whether quiz meets completion threshold
  bonuses: {
    perfect: number;       // Perfect score bonus XP
    speed: number;         // Speed completion bonus XP
    streak: number;        // Streak bonus XP
  };
}

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  progressPercentage: number;
}

/**
 * Calculate XP and score from quiz results
 * This is the ONLY function that should calculate XP from quiz completion
 */
export function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number,
  timeSpentSeconds: number = 0,
  currentStreak: number = 0
): QuizScoreResult {
  // Validate inputs
  if (totalQuestions <= 0) {
    logger.error('calculateQuizScore: Invalid totalQuestions', { totalQuestions });
    throw new Error('Total questions must be greater than 0');
  }
  
  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    logger.error('calculateQuizScore: Invalid correctAnswers', { correctAnswers, totalQuestions });
    throw new Error('Correct answers must be between 0 and total questions');
  }
  
  // Calculate percentage score
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  const isCompleted = score >= SCORING_CONSTANTS.COMPLETION_THRESHOLD;
  
  let xpEarned = 0;
  const bonuses = {
    perfect: 0,
    speed: 0,
    streak: 0
  };
  
  // Only award XP if quiz is completed (≥70%)
  if (isCompleted) {
    xpEarned = SCORING_CONSTANTS.BASE_XP_PER_COMPLETED_QUIZ;
    
    // Perfect score bonus
    if (score === 100) {
      bonuses.perfect = SCORING_CONSTANTS.PERFECT_SCORE_BONUS;
      xpEarned += bonuses.perfect;
    }
    
    // Speed bonus (average under 30 seconds per question)
    const avgTimePerQuestion = timeSpentSeconds / totalQuestions;
    if (avgTimePerQuestion > 0 && avgTimePerQuestion < 30) {
      bonuses.speed = SCORING_CONSTANTS.SPEED_BONUS;
      xpEarned += bonuses.speed;
    }
    
    // Streak bonus
    if (currentStreak >= 365) {
      bonuses.streak = SCORING_CONSTANTS.STREAK_BONUS.YEAR_STREAK;
    } else if (currentStreak >= 30) {
      bonuses.streak = SCORING_CONSTANTS.STREAK_BONUS.MONTH_STREAK;
    } else if (currentStreak >= 7) {
      bonuses.streak = SCORING_CONSTANTS.STREAK_BONUS.WEEK_STREAK;
    }
    xpEarned += bonuses.streak;
  }
  
  logger.debug('Quiz score calculated', {
    score,
    xpEarned,
    isCompleted,
    bonuses,
    inputs: { correctAnswers, totalQuestions, timeSpentSeconds, currentStreak }
  });
  
  return {
    score,
    xpEarned,
    isCompleted,
    bonuses
  };
}

/**
 * Calculate user level from total XP
 * Level progression: Each level requires progressively more XP
 */
export function calculateLevel(totalXP: number): LevelInfo {
  if (totalXP < 0) {
    logger.error('calculateLevel: Negative XP', { totalXP });
    throw new Error('Total XP cannot be negative');
  }
  
  // XP required per level (progressive curve)
  // Level 1: 0-50 XP
  // Level 2: 50-120 XP
  // Level 3: 120-210 XP
  // Level 4: 210-320 XP
  // etc. (each level requires 20 more XP than the previous)
  
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 50;
  let remainingXP = totalXP;
  
  while (remainingXP >= xpForNextLevel) {
    remainingXP -= xpForNextLevel;
    xpForCurrentLevel = xpForNextLevel;
    level++;
    xpForNextLevel = 50 + (level - 1) * 20;
  }
  
  const progressPercentage = Math.round((remainingXP / xpForNextLevel) * 100);
  
  return {
    currentLevel: level,
    currentXP: remainingXP,
    xpForNextLevel: xpForNextLevel,
    totalXP: totalXP,
    progressPercentage
  };
}

/**
 * Validate that XP calculation is consistent
 * Used for testing and verification
 */
export function validateXPCalculation(
  quizResults: Array<{
    score: number;
    xpEarned: number;
  }>
): { 
  isValid: boolean; 
  totalXP: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalXP = 0;
  
  for (let i = 0; i < quizResults.length; i++) {
    const result = quizResults[i];
    
    // Check XP is non-negative
    if (result.xpEarned < 0) {
      errors.push(`Quiz ${i}: Negative XP earned (${result.xpEarned})`);
    }
    
    // Check that XP is only awarded for completed quizzes
    if (result.score < SCORING_CONSTANTS.COMPLETION_THRESHOLD && result.xpEarned > 0) {
      errors.push(`Quiz ${i}: XP awarded for incomplete quiz (score: ${result.score}%, XP: ${result.xpEarned})`);
    }
    
    // Check maximum possible XP per quiz
    const maxPossibleXP = 
      SCORING_CONSTANTS.BASE_XP_PER_COMPLETED_QUIZ +
      SCORING_CONSTANTS.PERFECT_SCORE_BONUS +
      SCORING_CONSTANTS.SPEED_BONUS +
      SCORING_CONSTANTS.STREAK_BONUS.YEAR_STREAK;
    
    if (result.xpEarned > maxPossibleXP) {
      errors.push(`Quiz ${i}: XP exceeds maximum possible (${result.xpEarned} > ${maxPossibleXP})`);
    }
    
    totalXP += result.xpEarned;
  }
  
  const isValid = errors.length === 0;
  
  if (!isValid) {
    logger.warn('XP validation failed', { errors, totalXP });
  }
  
  return { isValid, totalXP, errors };
}

/**
 * Calculate weekly XP from quiz results
 * @param quizDates Array of quiz completion dates with XP earned
 */
export function calculateWeeklyXP(
  quizResults: Array<{
    completedAt: Date;
    xpEarned: number;
  }>,
  referenceDate: Date = new Date()
): number {
  // Get start of week (Monday 00:00:00)
  const weekStart = new Date(referenceDate);
  const dayOfWeek = weekStart.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  weekStart.setDate(weekStart.getDate() - daysToMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  // Get end of week (Sunday 23:59:59)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // Sum XP for quizzes completed this week
  const weeklyXP = quizResults
    .filter(result => {
      const date = new Date(result.completedAt);
      return date >= weekStart && date <= weekEnd;
    })
    .reduce((sum, result) => sum + result.xpEarned, 0);
  
  logger.debug('Weekly XP calculated', { weeklyXP, weekStart, weekEnd });
  
  return weeklyXP;
}