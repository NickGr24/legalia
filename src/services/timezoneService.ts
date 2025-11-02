/**
 * TIMEZONE SERVICE
 * Handles all timezone-related operations for Europe/Chisinau
 * Ensures consistent date/time handling across the app
 */

import { logger } from '../utils/logger';

// Canonical timezone for the application
export const APP_TIMEZONE = 'Europe/Chisinau';

/**
 * Get the current date in Europe/Chisinau timezone
 * Returns a Date object adjusted to the correct timezone
 */
export function getChisinauDate(date: Date = new Date()): Date {
  // Create a date string in the Europe/Chisinau timezone
  const chisinauDateString = date.toLocaleString('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the string back to a Date object
  const parts = chisinauDateString.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/);
  if (!parts) {
    logger.error('Failed to parse Chisinau date string', { chisinauDateString });
    return date; // Fallback to original date
  }
  
  const [, month, day, year, hour, minute, second] = parts;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

/**
 * Get today's date at midnight in Europe/Chisinau timezone
 * Used for streak calculations
 */
export function getChisinauMidnight(date: Date = new Date()): Date {
  const chisinauDate = getChisinauDate(date);
  chisinauDate.setHours(0, 0, 0, 0);
  return chisinauDate;
}

/**
 * Get the start of the current week (Monday) in Europe/Chisinau timezone
 */
export function getChisinauWeekStart(date: Date = new Date()): Date {
  const chisinauDate = getChisinauMidnight(date);
  const dayOfWeek = chisinauDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, we want Monday as start
  chisinauDate.setDate(chisinauDate.getDate() - daysToMonday);
  return chisinauDate;
}

/**
 * Get the end of the current week (Sunday) in Europe/Chisinau timezone
 */
export function getChisinauWeekEnd(date: Date = new Date()): Date {
  const weekStart = getChisinauWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Calculate the difference in days between two dates in Europe/Chisinau timezone
 * Used for streak calculations
 */
export function getDaysDifferenceChisinau(date1: Date, date2: Date): number {
  const midnight1 = getChisinauMidnight(date1);
  const midnight2 = getChisinauMidnight(date2);
  
  const diffMs = Math.abs(midnight2.getTime() - midnight1.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if two dates are on the same day in Europe/Chisinau timezone
 */
export function isSameDayChisinau(date1: Date, date2: Date): boolean {
  const midnight1 = getChisinauMidnight(date1);
  const midnight2 = getChisinauMidnight(date2);
  
  return midnight1.getTime() === midnight2.getTime();
}

/**
 * Check if two dates are consecutive days in Europe/Chisinau timezone
 * Used for streak continuation logic
 */
export function areConsecutiveDaysChisinau(earlierDate: Date, laterDate: Date): boolean {
  const midnight1 = getChisinauMidnight(earlierDate);
  const midnight2 = getChisinauMidnight(laterDate);
  
  const diffMs = midnight2.getTime() - midnight1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

/**
 * Format a date for display in Europe/Chisinau timezone
 */
export function formatChisinauDate(
  date: Date,
  format: 'full' | 'date' | 'time' | 'datetime' = 'datetime'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: APP_TIMEZONE
  };
  
  switch (format) {
    case 'full':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'date':
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
    case 'datetime':
    default:
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }
  
  return date.toLocaleString('ro-RO', options);
}

/**
 * Get a date string in YYYY-MM-DD format for Europe/Chisinau timezone
 * Used for database storage and comparisons
 */
export function getChisinauDateString(date: Date = new Date()): string {
  const chisinauDate = getChisinauDate(date);
  const year = chisinauDate.getFullYear();
  const month = String(chisinauDate.getMonth() + 1).padStart(2, '0');
  const day = String(chisinauDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string as a Europe/Chisinau date at midnight
 */
export function parseChisinauDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return getChisinauMidnight(date);
}

/**
 * Calculate streak information based on last activity date
 */
export interface StreakInfo {
  currentStreak: number;
  shouldResetStreak: boolean;
  shouldIncrementStreak: boolean;
  lastActiveDate: string;
  todayDate: string;
}

export function calculateStreakInfo(
  lastActiveDate: string | Date | null,
  currentStreak: number = 0
): StreakInfo {
  const today = getChisinauMidnight();
  const todayString = getChisinauDateString(today);
  
  if (!lastActiveDate) {
    // First activity ever
    return {
      currentStreak: 1,
      shouldResetStreak: false,
      shouldIncrementStreak: true,
      lastActiveDate: todayString,
      todayDate: todayString
    };
  }
  
  const lastActive = typeof lastActiveDate === 'string' 
    ? parseChisinauDateString(lastActiveDate)
    : getChisinauMidnight(lastActiveDate);
  const lastActiveString = getChisinauDateString(lastActive);
  
  // Check if same day
  if (isSameDayChisinau(lastActive, today)) {
    // Activity on the same day - no change to streak
    return {
      currentStreak,
      shouldResetStreak: false,
      shouldIncrementStreak: false,
      lastActiveDate: lastActiveString,
      todayDate: todayString
    };
  }
  
  // Check if consecutive days
  if (areConsecutiveDaysChisinau(lastActive, today)) {
    // Consecutive day - increment streak
    return {
      currentStreak: currentStreak + 1,
      shouldResetStreak: false,
      shouldIncrementStreak: true,
      lastActiveDate: todayString,
      todayDate: todayString
    };
  }
  
  // Streak broken - reset to 1
  return {
    currentStreak: 1,
    shouldResetStreak: true,
    shouldIncrementStreak: false,
    lastActiveDate: todayString,
    todayDate: todayString
  };
}

// Export utility for testing timezone calculations
export function testTimezoneCalculations(): void {
  const now = new Date();
  
  logger.info('Timezone test results', {
    currentTime: now.toISOString(),
    chisinauTime: getChisinauDate(now).toISOString(),
    chisinauMidnight: getChisinauMidnight(now).toISOString(),
    chisinauWeekStart: getChisinauWeekStart(now).toISOString(),
    chisinauWeekEnd: getChisinauWeekEnd(now).toISOString(),
    chisinauDateString: getChisinauDateString(now),
    formattedFull: formatChisinauDate(now, 'full'),
    formattedDate: formatChisinauDate(now, 'date'),
    formattedTime: formatChisinauDate(now, 'time'),
    formattedDatetime: formatChisinauDate(now, 'datetime')
  });
}