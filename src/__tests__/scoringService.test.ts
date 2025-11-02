/**
 * Unit Tests for Scoring Service
 * Tests XP calculation, bonuses, and level progression
 */

import { 
  calculateQuizScore, 
  calculateLevel, 
  validateXPCalculation,
  calculateWeeklyXP,
  SCORING_CONSTANTS 
} from '../services/scoringService';

describe('ScoringService', () => {
  describe('calculateQuizScore', () => {
    it('should calculate correct XP for completed quiz (≥70%)', () => {
      const result = calculateQuizScore(7, 10, 300, 0);
      
      expect(result.score).toBe(70);
      expect(result.isCompleted).toBe(true);
      expect(result.xpEarned).toBe(SCORING_CONSTANTS.BASE_XP_PER_COMPLETED_QUIZ);
      expect(result.bonuses.perfect).toBe(0);
      expect(result.bonuses.speed).toBe(0);
      expect(result.bonuses.streak).toBe(0);
    });
    
    it('should not award XP for incomplete quiz (<70%)', () => {
      const result = calculateQuizScore(6, 10, 300, 0);
      
      expect(result.score).toBe(60);
      expect(result.isCompleted).toBe(false);
      expect(result.xpEarned).toBe(0);
    });
    
    it('should add perfect score bonus for 100%', () => {
      const result = calculateQuizScore(10, 10, 300, 0);
      
      expect(result.score).toBe(100);
      expect(result.isCompleted).toBe(true);
      expect(result.xpEarned).toBe(
        SCORING_CONSTANTS.BASE_XP_PER_COMPLETED_QUIZ + 
        SCORING_CONSTANTS.PERFECT_SCORE_BONUS
      );
      expect(result.bonuses.perfect).toBe(SCORING_CONSTANTS.PERFECT_SCORE_BONUS);
    });
    
    it('should add speed bonus for fast completion', () => {
      const result = calculateQuizScore(10, 10, 250, 0); // 25 seconds per question
      
      expect(result.bonuses.speed).toBe(SCORING_CONSTANTS.SPEED_BONUS);
      expect(result.xpEarned).toBeGreaterThanOrEqual(
        SCORING_CONSTANTS.BASE_XP_PER_COMPLETED_QUIZ + 
        SCORING_CONSTANTS.SPEED_BONUS
      );
    });
    
    it('should add streak bonus for 7+ days', () => {
      const result = calculateQuizScore(10, 10, 300, 7);
      
      expect(result.bonuses.streak).toBe(SCORING_CONSTANTS.STREAK_BONUS.WEEK_STREAK);
    });
    
    it('should add streak bonus for 30+ days', () => {
      const result = calculateQuizScore(10, 10, 300, 30);
      
      expect(result.bonuses.streak).toBe(SCORING_CONSTANTS.STREAK_BONUS.MONTH_STREAK);
    });
    
    it('should add streak bonus for 365+ days', () => {
      const result = calculateQuizScore(10, 10, 300, 365);
      
      expect(result.bonuses.streak).toBe(SCORING_CONSTANTS.STREAK_BONUS.YEAR_STREAK);
    });
    
    it('should handle edge case: 0 questions', () => {
      expect(() => calculateQuizScore(0, 0, 0, 0)).toThrow();
    });
    
    it('should handle edge case: more correct than total', () => {
      expect(() => calculateQuizScore(11, 10, 0, 0)).toThrow();
    });
    
    it('should handle edge case: negative correct answers', () => {
      expect(() => calculateQuizScore(-1, 10, 0, 0)).toThrow();
    });
  });
  
  describe('calculateLevel', () => {
    it('should calculate level 1 for 0-49 XP', () => {
      expect(calculateLevel(0).currentLevel).toBe(1);
      expect(calculateLevel(25).currentLevel).toBe(1);
      expect(calculateLevel(49).currentLevel).toBe(1);
    });
    
    it('should calculate level 2 for 50-119 XP', () => {
      expect(calculateLevel(50).currentLevel).toBe(2);
      expect(calculateLevel(100).currentLevel).toBe(2);
      expect(calculateLevel(119).currentLevel).toBe(2);
    });
    
    it('should calculate level 3 for 120-209 XP', () => {
      expect(calculateLevel(120).currentLevel).toBe(3);
      expect(calculateLevel(150).currentLevel).toBe(3);
      expect(calculateLevel(209).currentLevel).toBe(3);
    });
    
    it('should calculate correct progress percentage', () => {
      const result = calculateLevel(60); // 10 XP into level 2 (50-120)
      expect(result.currentLevel).toBe(2);
      expect(result.currentXP).toBe(10);
      expect(result.xpForNextLevel).toBe(70);
      expect(result.progressPercentage).toBe(14); // 10/70 = ~14%
    });
    
    it('should handle negative XP', () => {
      expect(() => calculateLevel(-1)).toThrow();
    });
    
    it('should handle large XP values', () => {
      const result = calculateLevel(10000);
      expect(result.currentLevel).toBeGreaterThan(1);
      expect(result.totalXP).toBe(10000);
    });
  });
  
  describe('validateXPCalculation', () => {
    it('should validate correct XP calculations', () => {
      const quizResults = [
        { score: 100, xpEarned: 20 }, // Perfect score
        { score: 80, xpEarned: 15 },  // Normal completion
        { score: 60, xpEarned: 0 },   // Failed
      ];
      
      const validation = validateXPCalculation(quizResults);
      expect(validation.isValid).toBe(true);
      expect(validation.totalXP).toBe(35);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should detect negative XP', () => {
      const quizResults = [
        { score: 80, xpEarned: -5 },
      ];
      
      const validation = validateXPCalculation(quizResults);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Quiz 0: Negative XP earned (-5)');
    });
    
    it('should detect XP for incomplete quizzes', () => {
      const quizResults = [
        { score: 50, xpEarned: 15 }, // Should be 0
      ];
      
      const validation = validateXPCalculation(quizResults);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('XP awarded for incomplete quiz');
    });
    
    it('should detect excessive XP', () => {
      const quizResults = [
        { score: 100, xpEarned: 100 }, // Too much
      ];
      
      const validation = validateXPCalculation(quizResults);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('XP exceeds maximum possible');
    });
  });
  
  describe('calculateWeeklyXP', () => {
    it('should calculate weekly XP correctly', () => {
      const now = new Date('2024-01-15'); // Monday
      const quizResults = [
        { completedAt: new Date('2024-01-15'), xpEarned: 15 }, // This week
        { completedAt: new Date('2024-01-14'), xpEarned: 20 }, // This week (Sunday)
        { completedAt: new Date('2024-01-08'), xpEarned: 15 }, // Last week
      ];
      
      const weeklyXP = calculateWeeklyXP(quizResults, now);
      expect(weeklyXP).toBe(35); // Only this week's results
    });
    
    it('should handle empty results', () => {
      const weeklyXP = calculateWeeklyXP([]);
      expect(weeklyXP).toBe(0);
    });
    
    it('should handle future dates', () => {
      const now = new Date('2024-01-15');
      const quizResults = [
        { completedAt: new Date('2024-01-20'), xpEarned: 15 }, // Future
      ];
      
      const weeklyXP = calculateWeeklyXP(quizResults, now);
      expect(weeklyXP).toBe(0);
    });
  });
  
  describe('XP Invariants', () => {
    it('should maintain XP never decreases', () => {
      const results = [];
      let totalXP = 0;
      
      for (let i = 0; i < 100; i++) {
        const correct = Math.floor(Math.random() * 11);
        const result = calculateQuizScore(correct, 10, 300, 0);
        results.push({ score: result.score, xpEarned: result.xpEarned });
        
        const newTotal = totalXP + result.xpEarned;
        expect(newTotal).toBeGreaterThanOrEqual(totalXP);
        totalXP = newTotal;
      }
      
      const validation = validateXPCalculation(results);
      expect(validation.isValid).toBe(true);
    });
    
    it('should never award duplicate XP for same quiz attempt', () => {
      const result1 = calculateQuizScore(8, 10, 300, 0);
      const result2 = calculateQuizScore(8, 10, 300, 0);
      
      // Same inputs should give same outputs (deterministic)
      expect(result1.xpEarned).toBe(result2.xpEarned);
    });
    
    it('should ensure streak bonus is at most one per day', () => {
      // Only the max streak bonus should apply
      const result365 = calculateQuizScore(10, 10, 300, 365);
      const result400 = calculateQuizScore(10, 10, 300, 400);
      
      expect(result365.bonuses.streak).toBe(result400.bonuses.streak);
    });
  });
});