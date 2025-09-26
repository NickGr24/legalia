# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Legalia is a React Native mobile application built with Expo for legal education in Romanian. It features an AI-powered tutor, quiz system, and roadmap-style learning progression similar to Duolingo. The app supports both native platforms (iOS/Android) and web.

## Development Commands

```bash
# Start development server
npm start
expo start

# Platform-specific development
npm run android      # Android emulator/device
npm run ios         # iOS simulator/device  
npm run web         # Web browser

# Alternative commands with options
expo start --android --clear   # Clear cache
expo start --ios --tunnel      # Use tunnel connection
expo start --web --https       # Use HTTPS for web
```

## Architecture Overview

### Project Structure
- **src/components/** - Reusable UI components (cards, progress bars, quiz nodes, achievements)
- **src/screens/** - Main application screens (Home, Profile, Quiz, Results, Auth, Leaderboard)
- **src/navigation/** - Navigation setup (stack and tab navigators, quiz stack)
- **src/services/** - Data layer (Supabase service, authentication, leaderboard, sound manager)
- **src/contexts/** - React Context providers (AuthContext)
- **src/hooks/** - Custom React hooks (Supabase data, user progress, error handling)
- **src/utils/** - Shared utilities (colors, fonts, styles, TypeScript types, Supabase types)
- **src/data/** - Static data (achievements definitions)
- **assets/** - Static assets including sounds and images

### Navigation Structure
- **RootNavigator** (Stack): Main container with authentication flow
  - **Login/Register Screens**: Authentication screens
  - **TabNavigator** (Bottom Tabs): Home, Leaderboard, and Profile tabs
  - **QuizStackNavigator**: Nested stack for quiz flow
    - **DisciplineRoadmapScreen**: Quiz roadmap for each legal discipline
    - **QuizGameScreen**: Interactive quiz gameplay (modal)
    - **QuizResultScreen**: Results and scoring

### Database Architecture
The app uses **Supabase** as the primary backend with PostgreSQL database:

Key database tables:
- `home_discipline` - Legal disciplines (Civil, Criminal, Constitutional law)
- `home_quiz` - Quiz topics within each discipline  
- `home_question` - Quiz questions
- `home_answer` - Multiple choice answers with correct flags
- `home_marks_of_user` - User quiz completion tracking and scores
- `home_userstreak` - User streak tracking (current/longest streak, last activity)
- Built-in Supabase Auth tables for user authentication

### Key Services
- **SupabaseService** (`src/services/supabaseService.ts`): Primary data access layer with authentication
- **SupabaseClient** (`src/services/supabaseClient.ts`): Configured Supabase client instance
- **LeaderboardService** (`src/services/leaderboardService.ts`): Weekly leaderboard functionality
- **AchievementsService** (`src/services/achievementsService.ts`): User achievements tracking
- **SoundManager** (`src/services/soundManager.ts`): Audio playback for UI interactions
- **GoogleOAuthService** (`src/services/googleOAuthService.ts`): Google authentication integration

### TypeScript Configuration
- Path aliases configured in `tsconfig.json` for cleaner imports:
  - `@/*` → `src/*`
  - `@/components/*` → `src/components/*`
  - `@/screens/*` → `src/screens/*`
  - `@/navigation/*` → `src/navigation/*`
  - `@/utils/*` → `src/utils/*`
  - `@/services/*` → `src/services/*`
  - `@/assets/*` → `src/assets/*`
- Dual type system: `types.ts` for general types, `supabaseTypes.ts` for database schema types

### Design System
- Custom color palette defined in `src/utils/colors.ts`
- Typography scale in `src/utils/fonts.ts`  
- Shared styles in `src/utils/styles.ts`
- AI-EdTech design theme with dark navy primary colors

## Authentication & Backend

### Supabase Integration
- Real-time PostgreSQL database with Row Level Security (RLS)
- Built-in authentication with email/password and Google OAuth
- Automatic user session management via AuthContext
- Real-time data synchronization capabilities

### Authentication Flow
1. **Unauthenticated**: Shows Login/Register screens
2. **Authenticated**: Access to main app with TabNavigator
3. **Session Management**: Automatic token refresh and persistence

## Important Development Considerations

1. **Authentication First**: All data operations require authenticated user context via AuthContext
2. **Error Handling**: Use `useErrorHandler` hook for consistent error management across app
3. **Real-time Updates**: Supabase provides real-time subscriptions for live data updates
4. **Path Aliases**: Always use TypeScript path aliases (`@/`) for imports to maintain clean code structure
5. **Sound Management**: Audio files are managed through SoundManager service with proper resource cleanup
6. **Achievement System**: User achievements are calculated client-side but stored in Supabase for persistence

## Common Workflows

### Adding New Quiz Content
1. Insert data directly into Supabase database tables via dashboard or SQL
2. Ensure proper foreign key relationships between disciplines, quizzes, questions, and answers
3. Verify data structures match TypeScript interfaces in `src/utils/supabaseTypes.ts`
4. Test data access through SupabaseService methods

### Modifying Navigation
- Update type definitions in `RootStackParamList` and `TabParamList` (`src/utils/types.ts`)
- Modify navigator components in `src/navigation/` (RootNavigator, TabNavigator, QuizStackNavigator)
- Ensure screen components receive correct navigation props with TypeScript types
- Test authentication-based navigation flow

### Styling Changes  
- Use existing color system from `src/utils/colors.ts`
- Follow established typography scale in `fonts.ts`
- Maintain consistent spacing and component patterns from `styles.ts`
- Ensure dark theme compatibility across all new components

### Adding New Features
- Create custom hooks in `src/hooks/` for complex state logic
- Use AuthContext for user-related state management
- Implement proper error handling with useErrorHandler
- Add sound effects through SoundManager for user interactions
- Consider achievement integration for gamification features

## Environment Setup

### Required Environment Variables
```bash
# .env file
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing & Debugging

- Use Expo development tools and React Native Debugger
- Check Supabase dashboard for real-time database changes
- Monitor authentication state through AuthContext
- Test cross-platform compatibility (iOS/Android/Web)
- Verify sound playback on different platforms
- Test offline behavior and error handling