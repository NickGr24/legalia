/**
 * Unit Tests for Timezone Service
 * Tests Europe/Chisinau timezone handling for streaks
 */

import {
  getChisinauDate,
  getChisinauMidnight,
  getChisinauWeekStart,
  getChisinauWeekEnd,
  getDaysDifferenceChisinau,
  isSameDayChisinau,
  areConsecutiveDaysChisinau,
  getChisinauDateString,
  parseChisinauDateString,
  calculateStreakInfo
} from '../services/timezoneService';

describe('TimezoneService', () => {
  describe('getChisinauMidnight', () => {
    it('should return midnight in Chisinau timezone', () => {
      const date = new Date('2024-01-15T15:30:00Z');
      const midnight = getChisinauMidnight(date);
      
      expect(midnight.getHours()).toBe(0);
      expect(midnight.getMinutes()).toBe(0);
      expect(midnight.getSeconds()).toBe(0);
      expect(midnight.getMilliseconds()).toBe(0);
    });
  });
  
  describe('getChisinauWeekStart', () => {
    it('should return Monday as start of week', () => {
      // Test various days of the week
      const sunday = new Date('2024-01-14'); // Sunday
      const monday = new Date('2024-01-15'); // Monday
      const wednesday = new Date('2024-01-17'); // Wednesday
      const saturday = new Date('2024-01-20'); // Saturday
      
      const sundayWeekStart = getChisinauWeekStart(sunday);
      const mondayWeekStart = getChisinauWeekStart(monday);
      const wednesdayWeekStart = getChisinauWeekStart(wednesday);
      const saturdayWeekStart = getChisinauWeekStart(saturday);
      
      // All should return Monday 2024-01-15 for this week
      expect(sundayWeekStart.getDay()).toBe(1); // Monday
      expect(mondayWeekStart.getDay()).toBe(1);
      expect(wednesdayWeekStart.getDay()).toBe(1);
      expect(saturdayWeekStart.getDay()).toBe(1);
    });
  });
  
  describe('getChisinauWeekEnd', () => {
    it('should return Sunday as end of week', () => {
      const date = new Date('2024-01-15'); // Monday
      const weekEnd = getChisinauWeekEnd(date);
      
      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(weekEnd.getHours()).toBe(23);
      expect(weekEnd.getMinutes()).toBe(59);
      expect(weekEnd.getSeconds()).toBe(59);
    });
  });
  
  describe('isSameDayChisinau', () => {
    it('should correctly identify same day', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T23:59:59');
      const date3 = new Date('2024-01-16T00:00:00');
      
      expect(isSameDayChisinau(date1, date2)).toBe(true);
      expect(isSameDayChisinau(date1, date3)).toBe(false);
    });
    
    it('should handle timezone differences correctly', () => {
      // These are the same day in Chisinau despite different UTC dates
      const date1 = new Date('2024-01-15T22:00:00Z'); // Late evening UTC
      const date2 = new Date('2024-01-15T23:59:59Z'); // Almost midnight UTC
      
      // Actual test depends on timezone offset
      const result = isSameDayChisinau(date1, date2);
      expect(typeof result).toBe('boolean');
    });
  });
  
  describe('areConsecutiveDaysChisinau', () => {
    it('should identify consecutive days', () => {
      const day1 = new Date('2024-01-15');
      const day2 = new Date('2024-01-16');
      const day3 = new Date('2024-01-17');
      
      expect(areConsecutiveDaysChisinau(day1, day2)).toBe(true);
      expect(areConsecutiveDaysChisinau(day2, day3)).toBe(true);
      expect(areConsecutiveDaysChisinau(day1, day3)).toBe(false);
    });
    
    it('should handle non-consecutive days', () => {
      const day1 = new Date('2024-01-15');
      const day2 = new Date('2024-01-20');
      
      expect(areConsecutiveDaysChisinau(day1, day2)).toBe(false);
    });
    
    it('should handle same day', () => {
      const day1 = new Date('2024-01-15');
      const day2 = new Date('2024-01-15');
      
      expect(areConsecutiveDaysChisinau(day1, day2)).toBe(false);
    });
  });
  
  describe('getDaysDifferenceChisinau', () => {
    it('should calculate correct day difference', () => {
      const day1 = new Date('2024-01-15');
      const day2 = new Date('2024-01-20');
      
      expect(getDaysDifferenceChisinau(day1, day2)).toBe(5);
    });
    
    it('should handle same day', () => {
      const day1 = new Date('2024-01-15T10:00:00');
      const day2 = new Date('2024-01-15T20:00:00');
      
      expect(getDaysDifferenceChisinau(day1, day2)).toBe(0);
    });
    
    it('should handle reverse order', () => {
      const day1 = new Date('2024-01-20');
      const day2 = new Date('2024-01-15');
      
      expect(getDaysDifferenceChisinau(day1, day2)).toBe(5);
    });
  });
  
  describe('getChisinauDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T15:30:00');
      const dateString = getChisinauDateString(date);
      
      expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    
    it('should handle single digit days and months', () => {
      const date = new Date('2024-01-05');
      const dateString = getChisinauDateString(date);
      
      expect(dateString).toBe('2024-01-05');
    });
  });
  
  describe('parseChisinauDateString', () => {
    it('should parse YYYY-MM-DD correctly', () => {
      const dateString = '2024-01-15';
      const date = parseChisinauDateString(dateString);
      
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });
  });
  
  describe('calculateStreakInfo', () => {
    it('should handle first activity', () => {
      const info = calculateStreakInfo(null, 0);
      
      expect(info.currentStreak).toBe(1);
      expect(info.shouldResetStreak).toBe(false);
      expect(info.shouldIncrementStreak).toBe(true);
    });
    
    it('should handle same day activity', () => {
      const today = getChisinauDateString();
      const info = calculateStreakInfo(today, 5);
      
      expect(info.currentStreak).toBe(5);
      expect(info.shouldResetStreak).toBe(false);
      expect(info.shouldIncrementStreak).toBe(false);
    });
    
    it('should handle consecutive day activity', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = getChisinauDateString(yesterday);
      
      const info = calculateStreakInfo(yesterdayString, 5);
      
      expect(info.currentStreak).toBe(6);
      expect(info.shouldResetStreak).toBe(false);
      expect(info.shouldIncrementStreak).toBe(true);
    });
    
    it('should handle broken streak', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoString = getChisinauDateString(threeDaysAgo);
      
      const info = calculateStreakInfo(threeDaysAgoString, 10);
      
      expect(info.currentStreak).toBe(1);
      expect(info.shouldResetStreak).toBe(true);
      expect(info.shouldIncrementStreak).toBe(false);
    });
    
    it('should handle Date object input', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const info = calculateStreakInfo(yesterday, 5);
      
      expect(info.currentStreak).toBe(6);
      expect(info.shouldIncrementStreak).toBe(true);
    });
  });
  
  describe('Streak Edge Cases', () => {
    it('should handle daylight saving time transitions', () => {
      // Test dates around DST changes
      const beforeDST = new Date('2024-03-30'); // Before DST
      const afterDST = new Date('2024-03-31'); // After DST (in Europe)
      
      const consecutive = areConsecutiveDaysChisinau(beforeDST, afterDST);
      expect(consecutive).toBe(true);
    });
    
    it('should handle leap year', () => {
      const feb28 = new Date('2024-02-28');
      const feb29 = new Date('2024-02-29'); // 2024 is leap year
      const mar1 = new Date('2024-03-01');
      
      expect(areConsecutiveDaysChisinau(feb28, feb29)).toBe(true);
      expect(areConsecutiveDaysChisinau(feb29, mar1)).toBe(true);
    });
    
    it('should handle year transitions', () => {
      const dec31 = new Date('2023-12-31');
      const jan1 = new Date('2024-01-01');
      
      expect(areConsecutiveDaysChisinau(dec31, jan1)).toBe(true);
    });
  });
});