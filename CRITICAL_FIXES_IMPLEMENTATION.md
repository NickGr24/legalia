# CRITICAL FIXES IMPLEMENTATION GUIDE

## 🚨 Priority 1: Fix XP System Consistency

### Current Problem:
- JavaScript: Fixed 15 XP per quiz completion
- SQL: 10 XP per correct answer + bonuses
- Achievement system: 10 XP for first quiz

### Recommended Solution:

**1. Update leaderboardService.ts to use SQL functions:**

```typescript
// Replace the simplified calculation in getUserPointsFromQuizzes
export async function recordQuizCompletion(
  userId: string,
  quizId: number,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  timeTaken: number
): Promise<QuizCompletionResult | null> {
  try {
    // Use SQL function instead of hardcoded 15 XP
    const { data, error } = await supabase.rpc('record_quiz_completion', {
      p_user_id: userId,
      p_quiz_id: quizId,
      p_score: score / 100, // Convert percentage to decimal
      p_correct_answers: correctAnswers,
      p_total_questions: totalQuestions,
      p_time_taken: timeTaken,
      p_completed: score >= 70
    });

    if (error) throw error;
    return data[0]; // Return the points breakdown
  } catch (error) {
    console.error('Error recording quiz completion:', error);
    return null;
  }
}
```

**2. Update achievements to align with SQL calculation:**

```typescript
// In achievements.ts, update point values to match SQL
{
  id: 'first_quiz',
  title: 'Primii Pași', 
  description: 'Completează primul tău quiz în aplicație',
  category: 'quiz_progress',
  icon: '🎯',
  criteria: { type: 'quizzes_completed', target: 1 },
  rarity: 'common',
  points: 50, // Minimum points for 5/10 correct (5*10=50)
  hidden: false
}
```

## 🚨 Priority 2: Fix Timezone Handling

### Current Problem:
Streak calculation uses device local time instead of user's configured timezone.

### Recommended Solution:

**1. Add timezone utility functions:**

```typescript
// src/utils/timezone.ts
export class TimezoneHandler {
  static async getUserTimezone(userId: string): Promise<string> {
    const profile = await supabaseService.getUserProfile(userId);
    return profile?.timezone || 'UTC';
  }

  static getDateInTimezone(timezone: string, date: Date = new Date()): string {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn(`Invalid timezone ${timezone}, falling back to UTC`);
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'UTC',
        year: 'numeric', 
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }
  }

  static async getTodayForUser(userId: string): Promise<string> {
    const timezone = await this.getUserTimezone(userId);
    return this.getDateInTimezone(timezone);
  }
}
```

**2. Update streak logic in supabaseService.ts:**

```typescript
async updateUserStreak(): Promise<UserStreak> {
  const user = await this.requireAuth();
  
  // Use user's timezone instead of device local time
  const today = await TimezoneHandler.getTodayForUser(user.id);
  
  const currentStreak = await this.getUserStreak();
  
  if (!currentStreak) {
    // Create new streak record
    const { data, error } = await supabase
      .from('home_userstreak')
      .insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Calculate difference using timezone-aware dates
  const lastActiveDate = new Date(currentStreak.last_active_date + 'T00:00:00Z');
  const todayDate = new Date(today + 'T00:00:00Z');
  const diffDays = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

  let newCurrentStreak = currentStreak.current_streak;
  let newLongestStreak = currentStreak.longest_streak;

  if (diffDays === 0) {
    // Same day - no change to streak
    return currentStreak;
  } else if (diffDays === 1) {
    // Consecutive day - increment streak
    newCurrentStreak += 1;
    newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
  } else {
    // Streak broken - reset to 1
    newCurrentStreak = 1;
  }

  const { data, error } = await supabase
    .from('home_userstreak')
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

## 🚨 Priority 3: Remove Mock Data from Leaderboards

### Current Problem:
Production leaderboard service includes hardcoded mock users.

### Recommended Solution:

**1. Clean leaderboard service:**

```typescript
// Replace getLeaderboardWithRealUser function
export async function getLeaderboardWithRealUser(
  currentUserId: string,
  type: 'weekly' | 'alltime' = 'weekly'
): Promise<{
  leaderboard: LeaderboardEntry[];
  userStats: UserLeaderboardStats | null;
}> {
  try {
    // Use proper database views instead of mock data
    const { data: leaderboardData, error } = await supabase
      .from(type === 'weekly' ? 'leaderboard_users_week' : 'leaderboard_users_all_time')
      .select('*')
      .limit(100);

    if (error) throw error;

    // Get user's stats from the proper function
    const { data: userStats, error: statsError } = await supabase
      .rpc('get_user_leaderboard_stats', { p_user_id: currentUserId });

    if (statsError) {
      console.warn('Could not load user stats:', statsError);
    }

    // Transform to expected format
    const leaderboard: LeaderboardEntry[] = (leaderboardData || []).map(entry => ({
      rank_position: entry.rank_position,
      user_id: entry.user_id,
      user_name: entry.user_name || 'Anonymous',
      avatar_url: entry.avatar_url || '',
      weekly_points: type === 'weekly' ? entry.total_xp : undefined,
      total_points: type === 'alltime' ? entry.total_xp : undefined,
      is_current_user: entry.user_id === currentUserId,
    }));

    return {
      leaderboard,
      userStats: userStats?.[0] || null
    };

  } catch (error) {
    console.error('Error in getLeaderboardWithRealUser:', error);
    
    // Return empty state instead of mock data
    return {
      leaderboard: [],
      userStats: {
        total_points: 0,
        weekly_points: 0,
        alltime_rank: 0,
        weekly_rank: 0,
        total_users_count: 0,
        weekly_users_count: 0
      }
    };
  }
}
```

**2. Create proper database views:**

```sql
-- Create weekly leaderboard view
CREATE OR REPLACE VIEW leaderboard_users_week AS
WITH weekly_period AS (
  SELECT week_start, week_end 
  FROM weekly_leaderboard_periods 
  WHERE is_current = true
),
user_weekly_points AS (
  SELECT 
    up.user_id,
    COALESCE(SUM(xp.delta), 0) as total_xp
  FROM home_userprofile up
  LEFT JOIN home_user_xp_events xp ON xp.user_id = up.user_id
  CROSS JOIN weekly_period wp
  WHERE xp.timestamp >= wp.week_start 
    AND xp.timestamp < wp.week_end + INTERVAL '1 day'
  GROUP BY up.user_id
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY uwp.total_xp DESC) as rank_position,
  uwp.user_id,
  COALESCE(au.raw_user_meta_data->>'full_name', 
           au.raw_user_meta_data->>'name', 
           au.email, 
           'Anonymous') as user_name,
  up.university_name,
  uwp.total_xp,
  au.raw_user_meta_data->>'avatar_url' as avatar_url
FROM user_weekly_points uwp
JOIN auth.users au ON uwp.user_id = au.id
LEFT JOIN home_userprofile up ON up.user_id = uwp.user_id
LEFT JOIN home_university u ON u.id = up.university_id
WHERE uwp.total_xp > 0
ORDER BY uwp.total_xp DESC;
```

## 🚨 Priority 4: Deploy Missing SQL Functions

### Current Problem:
Critical SQL functions are not deployed, causing fallback to simplified logic.

### Recommended Solution:

**1. Deploy the functions using Supabase CLI:**

```bash
# Deploy points calculation functions
supabase db push --file points_calculation_functions.sql

# Deploy leaderboard functions  
supabase db push --file leaderboard_functions.sql

# Create weekly leaderboard periods table
supabase db push --file weekly_reset_cron.sql
```

**2. Add missing tables:**

```sql
-- Create weekly leaderboard periods table
CREATE TABLE IF NOT EXISTS weekly_leaderboard_periods (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL UNIQUE,
    week_end DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user points table
CREATE TABLE IF NOT EXISTS user_points (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize current week
INSERT INTO weekly_leaderboard_periods (week_start, week_end, is_current)
VALUES (
    date_trunc('week', CURRENT_DATE),
    date_trunc('week', CURRENT_DATE) + INTERVAL '6 days',
    true
) ON CONFLICT (week_start) DO UPDATE SET is_current = true;
```

## 🚨 Priority 5: Fix TypeScript Errors

### Current Problem:
42 TypeScript compilation errors affecting code reliability.

### Recommended Solution:

**1. Fix type definitions in utils/types.ts:**

```typescript
// Add missing properties to font config
export interface FontConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  // Add missing xxs property
  xxs: number;
}

// Fix navigation types
export type TabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
  Friends: undefined;
};

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
  // Add Leaderboard to root stack
  Leaderboard: undefined;
};
```

**2. Fix supabaseTypes.ts for friendships:**

```typescript
// Add friendships table to Database interface
export interface Database {
  public: {
    Tables: {
      // ... existing tables ...
      friendships: {
        Row: {
          id: number;
          requester_id: string;
          addressee_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          requester_id: string;
          addressee_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          requester_id?: string;
          addressee_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... rest of tables
    };
    // ... rest of interface
  };
}

export type Friendship = Database['public']['Tables']['friendships']['Row'];
```

## 🚨 Priority 6: Add Error Boundaries and Logging

### Recommended Solution:

**1. Create centralized error handler:**

```typescript
// src/utils/errorHandler.ts
export interface AppError {
  code: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export class ErrorHandler {
  static createError(
    code: string,
    message: string,
    context?: Record<string, any>
  ): AppError {
    return {
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      userId: 'current-user-id' // Get from auth context
    };
  }

  static async handle(error: AppError): Promise<void> {
    // Log locally
    console.error('AppError:', error);
    
    // Send to monitoring service (Sentry, etc.)
    try {
      await this.reportToService(error);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  static async reportToService(error: AppError): Promise<void> {
    // Implement integration with error monitoring service
    // For now, just log to Supabase for tracking
    try {
      await supabase.from('error_logs').insert({
        error_code: error.code,
        error_message: error.message,
        context: error.context,
        user_id: error.userId,
        timestamp: error.timestamp
      });
    } catch (e) {
      // Fail silently to avoid error loops
    }
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw this.createError(
            'RETRY_EXHAUSTED',
            `Operation failed after ${maxRetries} attempts`,
            { originalError: lastError.message, attempts: attempt }
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
}
```

**2. Update service methods to use error handler:**

```typescript
// Example update to supabaseService.ts
async submitQuizResult(
  quizId: number,
  score: number,
  correctAnswers: number,
  totalQuestions: number
): Promise<QuizResult> {
  try {
    return await ErrorHandler.retry(async () => {
      const user = await this.requireAuth();
      
      // Anti-cheating validations
      if (correctAnswers < 0 || correctAnswers > totalQuestions) {
        throw ErrorHandler.createError(
          'INVALID_QUIZ_SUBMISSION',
          'Invalid number of correct answers',
          { correctAnswers, totalQuestions, quizId }
        );
      }
      
      // ... rest of the method
      
    }, 3, 1000);
  } catch (error) {
    if (error instanceof AppError) {
      await ErrorHandler.handle(error);
      throw error;
    }
    
    const appError = ErrorHandler.createError(
      'QUIZ_SUBMISSION_FAILED',
      'Failed to submit quiz result',
      { quizId, score, correctAnswers, totalQuestions }
    );
    
    await ErrorHandler.handle(appError);
    throw appError;
  }
}
```

These implementations address the most critical reliability issues identified in the QA review and provide a foundation for building a robust, production-ready application.