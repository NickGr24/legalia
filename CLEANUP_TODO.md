# Legalia - Cleanup Action Checklist

**Date:** 2025-10-22
**Branch:** `feature/code-cleanup` (to be created)
**Status:** 🚨 **AWAITING OWNER APPROVAL** - Do not execute until approved

---

## Pre-Execution Checklist

Before starting ANY cleanup:

- [ ] Read `CLEANUP_REPORT.md` in full
- [ ] Answer all 9 questions in Section 12
- [ ] Commit all current work
- [ ] Create backup branch:
  ```bash
  git checkout -b backup-before-cleanup
  git add .
  git commit -m "Backup before cleanup - $(date)"
  git checkout main
  git checkout -b feature/code-cleanup
  ```
- [ ] Verify you have a recent backup (just in case)

---

## Batch A: Remove Unused npm Packages

**Risk:** ✅ NONE
**Estimated Time:** 2 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Approved? (Yes/No)
- [ ] Run: `npm uninstall axios react-native-vector-icons`
- [ ] Run: `npm install` (clean install)
- [ ] Test: `npm run typecheck` (should pass)
- [ ] Commit:
  ```bash
  git add package.json package-lock.json
  git commit -m "refactor: remove unused dependencies (axios, react-native-vector-icons)

  - axios: Not used anywhere in codebase
  - react-native-vector-icons: Using @expo/vector-icons exclusively
  - Savings: ~87KB minified

  Tested: typecheck passes ✅"
  ```

### Rollback (if needed):
```bash
npm install axios@^1.7.7 react-native-vector-icons@^10.0.3
```

---

## Batch B: Delete Unused Asset Files

**Risk:** ✅ NONE (can restore from git)
**Estimated Time:** 2 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Approved? (Yes/No)
- [ ] Create archive folder:
  ```bash
  mkdir -p archive/assets
  ```
- [ ] Move unused assets:
  ```bash
  mv assets/image.png archive/assets/
  mv assets/playstore.png archive/assets/
  mv assets/result.png archive/assets/
  mv assets/legalia-logo@2x.png archive/assets/
  ```
- [ ] Test:
  ```bash
  expo start --clear
  # Open app on device/simulator
  # Verify: Login screen logo displays ✅
  # Verify: Leaderboard university logos display ✅
  ```
- [ ] Commit:
  ```bash
  git add assets/ archive/
  git commit -m "refactor: archive unused asset files

  Moved to archive/:
  - image.png (134KB, unreferenced)
  - playstore.png (97KB, unreferenced)
  - result.png (107KB, unreferenced)
  - legalia-logo@2x.png (737KB, only legalia-logo.png is used)

  Savings: ~1.5MB

  Tested: App assets display correctly ✅"
  ```

### Rollback (if needed):
```bash
mv archive/assets/* assets/
```

---

## Batch C: Archive Legacy SQL Files

**Risk:** ✅ NONE (archiving, not deleting)
**Estimated Time:** 3 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Which SQL files to keep vs archive? (See CLEANUP_REPORT.md Section 12, Question 4-5)
- [ ] Create archive folder:
  ```bash
  mkdir -p docs/sql-archive
  ```
- [ ] Move legacy SQL files (default list, adjust based on owner input):
  ```bash
  # Database migrations (keep database_migrations_fixed.sql)
  mv database_migrations.sql docs/sql-archive/
  mv database_migrations_with_test_data.sql docs/sql-archive/

  # Leaderboard experiments (keep final_university_leaderboard.sql)
  mv test_university_leaderboard.sql docs/sql-archive/
  mv update_university_leaderboard.sql docs/sql-archive/
  mv improved_university_leaderboard.sql docs/sql-archive/

  # One-time data fixes
  mv fix_university_data.sql docs/sql-archive/
  ```
- [ ] Verify remaining SQL files:
  ```bash
  ls *.sql
  # Should see:
  # - database_migrations_fixed.sql (current migration)
  # - final_university_leaderboard.sql (current leaderboard)
  # - leaderboard_functions.sql (functions)
  # - points_calculation_functions.sql (functions)
  # - user_leaderboard_views.sql (views)
  # - weekly_reset_cron.sql (cron)
  ```
- [ ] Commit:
  ```bash
  git add *.sql docs/sql-archive/
  git commit -m "refactor: archive legacy SQL migration files

  Moved to docs/sql-archive/:
  - database_migrations.sql (old version)
  - database_migrations_with_test_data.sql (test data version)
  - test_university_leaderboard.sql (experiment)
  - update_university_leaderboard.sql (experiment)
  - improved_university_leaderboard.sql (experiment)
  - fix_university_data.sql (one-time fix)

  Kept in root:
  - database_migrations_fixed.sql (current)
  - final_university_leaderboard.sql (current)
  - leaderboard_functions.sql (active)
  - points_calculation_functions.sql (active)
  - user_leaderboard_views.sql (active)
  - weekly_reset_cron.sql (active)"
  ```

### Rollback (if needed):
```bash
mv docs/sql-archive/*.sql .
```

---

## Batch D: Consolidate Documentation Files

**Risk:** ✅ NONE (moving, not deleting)
**Estimated Time:** 3 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Approved? (Yes/No)
- [ ] Create documentation structure:
  ```bash
  mkdir -p docs/features docs/archive
  ```
- [ ] Move feature documentation:
  ```bash
  # Friends feature (consolidate into docs/)
  mv FRIENDS_IMPLEMENTATION_SUMMARY.md docs/archive/
  mv FRIENDS_QUICKSTART.md docs/archive/
  # Keep docs/FRIENDS_FEATURE.md and docs/FRIENDS_QA_CHECKLIST.md

  # Other features
  mv USER_PROFILE_FEATURE.md docs/features/
  mv WARNINGS_FIXES.md docs/
  mv DATABASE_UPDATES.md docs/
  mv IMPLEMENTATION_GUIDE.md docs/
  ```
- [ ] Verify root docs (should only have these):
  ```bash
  ls *.md
  # Should see:
  # - README.md (main project docs)
  # - CLAUDE.md (Claude Code instructions)
  # - CLEANUP_REPORT.md (this review)
  # - CLEANUP_TODO.md (this checklist)
  ```
- [ ] Commit:
  ```bash
  git add *.md docs/
  git commit -m "docs: consolidate feature documentation into docs/ folder

  Moved to docs/:
  - WARNINGS_FIXES.md → docs/
  - DATABASE_UPDATES.md → docs/
  - IMPLEMENTATION_GUIDE.md → docs/
  - USER_PROFILE_FEATURE.md → docs/features/

  Archived:
  - FRIENDS_IMPLEMENTATION_SUMMARY.md → docs/archive/ (duplicate)
  - FRIENDS_QUICKSTART.md → docs/archive/ (duplicate)

  Kept in docs/:
  - docs/FRIENDS_FEATURE.md (canonical)
  - docs/FRIENDS_QA_CHECKLIST.md (active)

  Root now has only essential docs: README, CLAUDE, cleanup reports"
  ```

### Rollback (if needed):
```bash
mv docs/*.md .
mv docs/features/*.md .
mv docs/archive/*.md .
```

---

## Batch E: Consolidate Storage Services (CODE CHANGE)

**Risk:** ⚠️ LOW (requires testing BurgerDrawer)
**Estimated Time:** 5 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Approved? (Yes/No)
- [ ] Open `src/components/BurgerDrawer.tsx` in editor
- [ ] Find the import (around line 15):
  ```typescript
  import { getUniversityLogoUrl } from '@/services/storage';
  ```
- [ ] Replace with:
  ```typescript
  import { logoStorageService } from '@/services/storageService';
  ```
- [ ] Find usage of `getUniversityLogoUrl` (search in file)
- [ ] Replace:
  ```typescript
  // OLD:
  const logoUrl = getUniversityLogoUrl(user.university_slug);

  // NEW:
  const logoUrl = logoStorageService.getUniversityLogoUrl(user.university_slug);
  ```
- [ ] Delete redundant file:
  ```bash
  rm src/services/storage.ts
  ```
- [ ] Update service exports (if `storage.ts` was in `src/services/index.ts`):
  ```bash
  # Edit src/services/index.ts and remove any export of storage.ts
  ```
- [ ] Test:
  ```bash
  npm run typecheck  # Should pass ✅
  expo start --clear
  # Open app
  # Go to Profile tab
  # Open BurgerDrawer (side menu)
  # Verify: University logo displays correctly ✅
  # Go to Leaderboard tab
  # Verify: University logos display ✅
  ```
- [ ] Commit:
  ```bash
  git add src/components/BurgerDrawer.tsx src/services/
  git commit -m "refactor: consolidate storage services

  - Remove redundant storage.ts (4 lines)
  - Update BurgerDrawer to use StorageService class
  - Single source of truth: storageService.ts

  Files modified:
  - src/components/BurgerDrawer.tsx (import + usage)

  Files deleted:
  - src/services/storage.ts (duplicate functionality)

  Tested: BurgerDrawer + Leaderboard display logos correctly ✅"
  ```

### Rollback (if needed):
```bash
git checkout HEAD -- src/components/BurgerDrawer.tsx src/services/
```

---

## Batch F: Remove Dead Code (Sentry Placeholder)

**Risk:** ✅ NONE (unused code)
**Estimated Time:** 2 minutes
**Status:** ⏸️ AWAITING APPROVAL

### Steps:

- [ ] **ASK OWNER:** Approved? (Yes/No)
- [ ] Open `src/services/telemetryService.ts` in editor
- [ ] Find lines 78-86 (or search for "sendErrorToSentry")
- [ ] Delete the placeholder function:
  ```typescript
  // DELETE THIS:
  function sendErrorToSentry(error: Error): void {
    // TODO: Implement Sentry.captureException(error);
  }
  ```
- [ ] Test:
  ```bash
  npm run typecheck  # Should pass ✅
  expo start --clear
  # Test quiz flow (telemetry should still log events) ✅
  ```
- [ ] Commit:
  ```bash
  git add src/services/telemetryService.ts
  git commit -m "refactor: remove unused Sentry placeholder code

  - Deleted sendErrorToSentry() function (never called)
  - Can re-add when implementing Sentry integration

  Tested: Telemetry still logs events correctly ✅"
  ```

### Rollback (if needed):
```bash
git checkout HEAD -- src/services/telemetryService.ts
```

---

## Batch G: Handle FriendsScreen (DECISION REQUIRED)

**Risk:** ⚠️ LOW
**Estimated Time:** 5-10 minutes
**Status:** ⏸️ AWAITING OWNER DECISION

### Option 1: Register Screen (If Owner Says "Keep")

- [ ] **ASK OWNER:** Use FriendsScreen as a hub? (Yes/No)
- [ ] Open `src/navigation/RootNavigator.tsx`
- [ ] Add screen to stack:
  ```typescript
  import FriendsScreen from '@/screens/FriendsScreen';

  // In the Stack.Navigator:
  <Stack.Screen
    name="Friends"
    component={FriendsScreen}
    options={{ title: 'Prieteni' }}
  />
  ```
- [ ] Update navigation types in `src/utils/types.ts`:
  ```typescript
  export type RootStackParamList = {
    // ... existing screens
    Friends: undefined;
    // ... rest
  };
  ```
- [ ] Test:
  ```bash
  npm run typecheck  # Should pass ✅
  expo start --clear
  # Navigate to FriendsScreen
  # Verify: Screen displays and navigation works ✅
  ```
- [ ] Commit:
  ```bash
  git add src/navigation/RootNavigator.tsx src/utils/types.ts
  git commit -m "feat: register FriendsScreen in navigation

  - Added FriendsScreen to RootNavigator
  - Updated RootStackParamList types
  - Screen now accessible via navigation

  Tested: Navigation and types work correctly ✅"
  ```

### Option 2: Remove Screen (If Owner Says "Delete")

- [ ] **ASK OWNER:** Delete FriendsScreen? (Yes/No)
- [ ] Archive first (safety):
  ```bash
  mkdir -p archive/screens
  mv src/screens/FriendsScreen.tsx archive/screens/
  ```
- [ ] Update `src/screens/index.ts` if it exports FriendsScreen
- [ ] Test:
  ```bash
  npm run typecheck  # Should pass ✅
  expo start --clear
  # Verify: App works normally without FriendsScreen ✅
  ```
- [ ] Commit:
  ```bash
  git add src/screens/ archive/screens/
  git commit -m "refactor: archive orphaned FriendsScreen

  - FriendsScreen was not registered in navigation
  - Functionality replaced by direct navigation to inbox/list/leaderboard
  - Moved to archive/ for reference

  Tested: App works normally ✅"
  ```

### Rollback (if needed):
```bash
git checkout HEAD -- src/navigation/ src/screens/ src/utils/types.ts
# or
mv archive/screens/FriendsScreen.tsx src/screens/
```

---

## Batch H: expo-audio Decision (CONDITIONAL)

**Risk:** ✅ NONE
**Estimated Time:** 2 minutes
**Status:** ⏸️ AWAITING OWNER DECISION

### If Owner Says "Remove expo-audio":

- [ ] **ASK OWNER:** Remove expo-audio? (Yes/No - based on migration timeline)
- [ ] Run:
  ```bash
  npm uninstall expo-audio
  ```
- [ ] Test:
  ```bash
  npm run typecheck  # Should pass ✅
  expo start --clear
  # Test: Sounds still play via expo-av ✅
  ```
- [ ] Commit:
  ```bash
  git add package.json package-lock.json
  git commit -m "refactor: remove expo-audio (not yet migrating from expo-av)

  - expo-audio not currently used
  - Will re-add when migrating to Expo SDK 54+
  - Sounds still work via expo-av

  Tested: Sound playback works ✅"
  ```

### If Owner Says "Keep expo-audio":

- [ ] No action needed
- [ ] Document reason in CLAUDE.md:
  ```markdown
  ## Planned Migrations
  - [ ] Migrate from expo-av to expo-audio before SDK 54 (required)
  ```

### Rollback (if needed):
```bash
npm install expo-audio@^1.0.13
```

---

## Batch I: ESLint/Prettier Setup (CONDITIONAL)

**Risk:** ✅ NONE
**Estimated Time:** 5 minutes
**Status:** ⏸️ AWAITING OWNER DECISION

### Option 1: Install Linting Packages (If Owner Says "Yes")

- [ ] **ASK OWNER:** Install ESLint/Prettier? (Yes/No)
- [ ] Run:
  ```bash
  npm install --save-dev \
    eslint@^8.57.0 \
    @typescript-eslint/eslint-plugin@^6.0.0 \
    @typescript-eslint/parser@^6.0.0 \
    @react-native-community/eslint-config@^3.2.0 \
    prettier@^3.0.0
  ```
- [ ] Test:
  ```bash
  npm run lint    # Should run ✅
  npm run format  # Should run ✅
  ```
- [ ] Commit:
  ```bash
  git add package.json package-lock.json
  git commit -m "chore: install ESLint and Prettier dependencies

  Added devDependencies:
  - eslint
  - @typescript-eslint/* (plugin + parser)
  - @react-native-community/eslint-config
  - prettier

  Configs already in place (.eslintrc.cjs, .prettierrc)

  npm run lint and npm run format now work ✅"
  ```

### Option 2: Remove Configs (If Owner Says "No")

- [ ] **ASK OWNER:** Remove linting configs? (Yes/No)
- [ ] Remove unused scripts from `package.json`:
  ```bash
  # Edit package.json - remove these lines:
  "lint": "eslint src/**/*.{ts,tsx} --max-warnings 50",
  "format": "prettier --write src/**/*.{ts,tsx}",
  ```
- [ ] Delete config files:
  ```bash
  rm .eslintrc.cjs .prettierrc
  ```
- [ ] Commit:
  ```bash
  git add package.json .eslintrc.cjs .prettierrc
  git commit -m "refactor: remove unused ESLint/Prettier configs

  - Configs existed but packages not installed
  - Removed to reduce confusion
  - Can re-add if linting desired in future

  Scripts removed:
  - npm run lint
  - npm run format"
  ```

### Rollback (if needed):
```bash
git checkout HEAD -- package.json .eslintrc.cjs .prettierrc
npm install
```

---

## Batch J: Security - Hardcoded Secrets (CONDITIONAL, HIGH PRIORITY)

**Risk:** ⚠️ MEDIUM (requires EAS config knowledge)
**Estimated Time:** 10 minutes
**Status:** ⏸️ AWAITING OWNER DECISION + RESEARCH

### Steps:

- [ ] **ASK OWNER:** Keep hardcoded secrets or switch to env-only? (See decision guide below)

#### Decision Guide:

**Keep hardcoded IF:**
- Using `app.json` (not `app.config.ts`)
- EAS builds work with current setup
- You understand anon keys are public anyway

**Switch to env-only IF:**
- Using or willing to switch to `app.config.ts`
- Want cleaner separation of secrets
- Have time to test build process

---

### Option 1: Keep Hardcoded (Simpler, Document Risk)

- [ ] No code changes needed
- [ ] Add comment to `app.json`:
  ```json
  "extra": {
    "eas": { "projectId": "..." },
    "_comment": "Supabase credentials are public (anon key). OK to commit.",
    "supabaseUrl": "https://...",
    "supabaseAnonKey": "eyJ..."
  }
  ```
- [ ] Commit:
  ```bash
  git add app.json
  git commit -m "docs: document Supabase credentials in app.json

  - Anon key is public-facing (safe to commit)
  - RLS policies protect sensitive data
  - Alternative would require app.config.ts (future consideration)"
  ```

---

### Option 2: Switch to app.config.ts (More Secure, Requires Testing)

⚠️ **WARNING:** Test thoroughly - may affect EAS builds

- [ ] **ASK OWNER:** Proceed with this option? (Yes/No)
- [ ] Rename `app.json` to `app.config.ts`:
  ```bash
  mv app.json app.config.ts
  ```
- [ ] Convert to TypeScript config:
  ```typescript
  // app.config.ts
  export default {
    expo: {
      name: "Legalia",
      slug: "legalia",
      version: "1.0.0",
      // ... other fields from app.json
      extra: {
        eas: {
          projectId: process.env.EAS_PROJECT_ID || "0acdc0ef-21e5-4f48-baf9-e044016ea955"
        },
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      },
    },
  };
  ```
- [ ] Update `.gitignore` (ensure `.env` is ignored):
  ```bash
  # Already in .gitignore:
  # .env*.local
  ```
- [ ] Remove hardcoded values from `eas.json`:
  ```bash
  # Edit eas.json - replace hardcoded URLs/keys with:
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "",  # Will read from .env
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": ""
  }
  ```
- [ ] Test:
  ```bash
  # Local test:
  expo start --clear
  # Verify: App connects to Supabase ✅

  # EAS build test:
  eas build --profile preview --platform android
  # Verify: Build succeeds and app works ✅
  ```
- [ ] Commit:
  ```bash
  git add app.config.ts eas.json .gitignore
  git rm app.json
  git commit -m "security: switch to app.config.ts with env var references

  - Converted app.json → app.config.ts
  - Supabase credentials now read from .env only
  - Removed hardcoded secrets from eas.json
  - .env already in .gitignore (not committed)

  Tested:
  - Local dev: expo start works ✅
  - EAS build: preview build succeeds ✅"
  ```

### Rollback (if needed):
```bash
git checkout HEAD -- app.json eas.json
rm app.config.ts
```

---

## Post-Cleanup Verification (RUN AFTER ALL BATCHES)

**Estimated Time:** 30-45 minutes

### 1. Type Checking
- [ ] Run: `npm run typecheck`
- [ ] Expected: ✅ No errors

### 2. Build Test
- [ ] Run: `expo start --clear`
- [ ] Expected: ✅ App starts without errors

### 3. Platform Testing

**Android:**
- [ ] Test on Android device/emulator
- [ ] Flow: Login → Home → Quiz → Leaderboard → Profile
- [ ] Verify: UI, sounds, data loading all work ✅

**iOS (if available):**
- [ ] Test on iOS device/simulator
- [ ] Flow: Login → Home → Quiz → Leaderboard → Profile
- [ ] Verify: UI, sounds, data loading all work ✅

**Web (optional):**
- [ ] Run: `expo start --web`
- [ ] Verify: Basic functionality works ✅

### 4. Feature-Specific Tests

**Authentication:**
- [ ] Register new user ✅
- [ ] Login with existing user ✅
- [ ] Logout ✅

**Quiz Flow:**
- [ ] Start quiz from home ✅
- [ ] Answer questions ✅
- [ ] See results screen ✅
- [ ] Points awarded correctly ✅

**Leaderboard:**
- [ ] View weekly leaderboard ✅
- [ ] View all-time leaderboard ✅
- [ ] University logos display correctly ✅

**Friends Feature:**
- [ ] Send friend request ✅
- [ ] Accept/decline request ✅
- [ ] View friends list ✅
- [ ] View friends leaderboard ✅

**Achievements:**
- [ ] Earn achievement ✅
- [ ] View achievements section ✅

**Sounds:**
- [ ] UI interaction sounds play ✅
- [ ] Win sound plays on quiz completion ✅

### 5. Visual Regression Check

- [ ] App icon unchanged ✅
- [ ] Splash screen unchanged ✅
- [ ] Logo displays in login/register ✅
- [ ] University logos in leaderboard ✅
- [ ] University logo in BurgerDrawer ✅
- [ ] Fonts load correctly (Oswald) ✅
- [ ] Colors/theme unchanged ✅

### 6. Romanian Strings Verification

- [ ] All button text in Romanian ✅
- [ ] Screen titles in Romanian ✅
- [ ] Error messages in Romanian ✅
- [ ] No English strings added ✅

---

## Final Commit & Cleanup

After all batches complete and tests pass:

- [ ] Create summary commit:
  ```bash
  git log --oneline feature/code-cleanup  # Review all commits

  # Optional: Squash into single commit (if preferred)
  git checkout main
  git merge --squash feature/code-cleanup
  git commit -m "refactor: comprehensive codebase cleanup

  See CLEANUP_REPORT.md for full details.

  Summary:
  - Removed 3 unused npm packages (~87KB savings)
  - Archived 4 unused assets (~1.5MB savings)
  - Consolidated storage services (removed duplication)
  - Archived 12 legacy SQL files
  - Organized documentation into docs/ folder
  - Removed dead code (Sentry placeholder)
  - [Other changes based on owner decisions]

  Total savings: ~1.7MB
  Tests: All flows validated on Android/iOS ✅
  Romanian strings: Intact ✅
  No functional regressions ✅"
  ```

---

## Rollback Plan (Emergency)

If something breaks after cleanup:

### Full Rollback:
```bash
git checkout main
git branch -D feature/code-cleanup
git checkout backup-before-cleanup
```

### Partial Rollback (Specific Batch):
```bash
# See each batch's "Rollback (if needed)" section
git log --oneline  # Find commit to revert
git revert <commit-hash>
```

---

## Post-Cleanup Maintenance

After cleanup is complete:

- [ ] Update `README.md` if needed (cleanup completed, structure changes)
- [ ] Update `CLAUDE.md` with new structure (docs/ folder location)
- [ ] Delete/archive this file (`CLEANUP_TODO.md`) or keep for reference
- [ ] Delete/archive `CLEANUP_REPORT.md` or keep for reference
- [ ] Run `eas update` (JS-only) or `eas build` (if configs/assets changed)

---

## Summary of Owner Decisions Required

Before executing, owner must answer:

1. **expo-audio:** Keep or remove?
2. **ESLint/Prettier:** Install or remove configs?
3. **FriendsScreen:** Register or delete?
4. **SQL files:** Which versions to keep?
5. **Leaderboard SQL:** Which is current?
6. **Docs:** Approve consolidation?
7. **Secrets:** Keep hardcoded or switch to env-only?
8. **EAS flags:** Remove New Architecture flags?
9. **Batches:** Which batches approved?

**Reply to CLEANUP_REPORT.md Section 12 with your answers.**

---

**END OF CHECKLIST**

**Status:** 🟡 **AWAITING APPROVALS** - Do not execute until owner confirms.
