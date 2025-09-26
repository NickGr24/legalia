# Points & Leaderboard System Implementation Guide

## Overview

This implementation provides a comprehensive points and leaderboard system for the Legalia React Native app with Supabase backend. The system awards points for quiz completion with bonuses for speed and perfect runs, maintains both all-time and weekly leaderboards, and automatically resets weekly scores.

## Points System

### Scoring Formula

**Base Points:** 10 points per correct answer

**Speed Bonus:** Up to 5 additional points
- Awarded when quiz completed under target time (30 seconds per question)
- Formula: `min(5, max(0, time_saved_seconds / 10))`
- Example: Complete 10-question quiz in 200 seconds vs target 300 seconds = 100 seconds saved = 10 speed bonus points (capped at 5)

**Perfect Run Bonus:** 20 additional points
- Awarded when quiz completed with 100% score and zero mistakes

**Total Points:** `base_points + speed_bonus + perfect_bonus`

### Example Scenarios

1. **Basic completion:** 7 correct out of 10 questions = 70 base points
2. **Fast completion:** 10 correct in 200s (vs 300s target) = 100 base + 5 speed = 105 points
3. **Perfect run:** 10 correct with no mistakes = 100 base + 20 perfect = 120 points
4. **Perfect fast run:** 10 correct, no mistakes, 200s = 100 base + 5 speed + 20 perfect = 125 points

## Database Schema Changes

### New Columns in `home_marks_of_user`
```sql
points_earned INTEGER DEFAULT 0
time_taken INTEGER DEFAULT 0  -- seconds
perfect_run BOOLEAN DEFAULT FALSE
speed_bonus INTEGER DEFAULT 0
perfect_bonus INTEGER DEFAULT 0
```

### New Tables
```sql
user_points (
    user_id UUID,
    total_points INTEGER,
    weekly_points INTEGER,
    last_updated TIMESTAMP
)

weekly_leaderboard_periods (
    week_start DATE,
    week_end DATE,  
    is_current BOOLEAN
)
```

## Implementation Steps

### 1. Database Setup

Run the migrations in this order:
```bash
# 1. Apply schema changes
psql -f database_migrations.sql

# 2. Create points calculation functions  
psql -f points_calculation_functions.sql

# 3. Create leaderboard functions
psql -f leaderboard_functions.sql
```

### 2. Quiz Integration

Replace your current quiz completion logic with:

```typescript
import { recordQuizCompletion, useQuizCompletion } from './react_native_integration';

// In your quiz completion handler
const handleQuizComplete = async (
  correctAnswers: number,
  totalQuestions: number,
  timeTaken: number // in seconds
) => {
  const result = await recordQuizCompletion(
    userId,
    quizId, 
    correctAnswers / totalQuestions, // score as decimal
    correctAnswers,
    totalQuestions,
    timeTaken
  );
  
  if (result) {
    // Show points earned animation
    showPointsAnimation(result);
  }
};
```

### 3. Leaderboard Display

```typescript
import { useLeaderboard } from './react_native_integration';

function LeaderboardScreen() {
  const { allTimeLeaderboard, weeklyLeaderboard, userStats, loading } = useLeaderboard(userId);
  
  // Display top 100 + current user position
  return (
    <View>
      {/* All-time leaderboard */}
      {allTimeLeaderboard.map(entry => (
        <LeaderboardRow 
          key={entry.user_id}
          rank={entry.rank_position}
          name={entry.user_name}
          points={entry.total_points}
          isCurrentUser={entry.is_current_user}
        />
      ))}
    </View>
  );
}
```

### 4. Weekly Reset Automation

Choose one option:

**Option A: Supabase Edge Function (Recommended)**
1. Create Edge Function with the code in `weekly_reset_cron.sql`
2. Set up external cron job (GitHub Actions, Vercel Cron, etc.) to call it weekly

**Option B: Application-level Check**
- The system automatically checks for weekly reset when fetching leaderboards
- Call `checkAndResetWeeklyLeaderboard()` before displaying leaderboards

## API Functions

### Points System
- `record_quiz_completion()` - Records quiz and updates user points
- `calculate_quiz_points()` - Preview points calculation
- `recalculate_user_points()` - Maintenance function

### Leaderboards  
- `get_alltime_leaderboard()` - Top 100 + current user all-time
- `get_weekly_leaderboard()` - Top 100 + current user weekly
- `get_user_leaderboard_stats()` - User's current rankings
- `get_leaderboard_summary()` - Dashboard summary data

### Weekly Reset
- `reset_weekly_leaderboard()` - Manual reset function
- `check_and_reset_weekly_leaderboard()` - Auto-check and reset

## Security Considerations

### Row Level Security (RLS)
- Enabled on `user_points` and `weekly_leaderboard_periods` tables
- Users can view all leaderboard data but only update their own points
- All functions use `SECURITY DEFINER` for controlled access

### Data Integrity
- Points calculation happens server-side only
- Quiz attempts use `ON CONFLICT` to prevent duplicate submissions
- Only better scores update existing records

### Performance Optimizations
- Indexes on points columns for fast leaderboard queries
- Batch updates for user points recalculation
- Efficient ranking queries with window functions

## Frontend Integration

### Quiz Results Animation
```typescript
const showPointsAnimation = (result: QuizCompletionResult) => {
  const breakdown = formatPointsBreakdown(result);
  
  // Animate each point type separately
  breakdown.forEach((item, index) => {
    setTimeout(() => {
      animatePointsEarned(item.points, item.label, item.icon);
    }, index * 500);
  });
};
```

### Leaderboard Components
- Show rank badges for top positions (🥇🥈🥉)
- Highlight current user row
- Display both all-time and weekly tabs
- Handle empty states gracefully

## Testing & Maintenance

### Test Scenarios
1. Quiz completion with various scores and times
2. Multiple quiz attempts (ensure only best score counts for points)
3. Weekly reset functionality
4. Leaderboard display with edge cases (ties, new users)

### Monitoring
- Track points calculation accuracy
- Monitor weekly reset execution
- Check for any orphaned data in user_points table

### Maintenance Tasks
```sql
-- Recalculate all user points (if needed)
SELECT recalculate_user_points();

-- Manual weekly reset (if automation fails)
SELECT reset_weekly_leaderboard();

-- Check current leaderboard period
SELECT * FROM weekly_leaderboard_periods WHERE is_current = true;
```

## Deployment Checklist

- [ ] Run database migrations in order
- [ ] Test points calculation with sample data
- [ ] Verify leaderboard queries return expected results
- [ ] Set up weekly reset automation
- [ ] Update React Native quiz completion logic
- [ ] Implement leaderboard screens
- [ ] Test cross-platform compatibility (iOS/Android/Web)
- [ ] Configure RLS policies in production
- [ ] Set up monitoring for weekly resets

## Support & Troubleshooting

### Common Issues
1. **Points not updating:** Check `record_quiz_completion` function logs
2. **Weekly reset not working:** Verify cron job or call `check_and_reset_weekly_leaderboard()`
3. **Leaderboard empty:** Ensure users have completed quizzes and earned points
4. **Performance issues:** Check if indexes are created properly

### Debug Queries
```sql
-- Check user's points history
SELECT * FROM home_marks_of_user WHERE user_id = 'user-uuid-here';

-- Check aggregated points
SELECT * FROM user_points WHERE user_id = 'user-uuid-here';

-- View current leaderboard period
SELECT * FROM weekly_leaderboard_periods WHERE is_current = true;
```