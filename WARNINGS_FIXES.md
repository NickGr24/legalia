# App Warnings - Recommended Fixes

## Status: ⚠️ Non-Critical (App is Running)

These warnings won't break your app, but should be addressed before future Expo SDK upgrades.

---

## 1. Expo AV Deprecation Warning

### Warning Message
```
WARN [expo-av]: Expo AV has been deprecated and will be removed in SDK 54.
Use the 'expo-audio' and 'expo-video' packages to replace the required functionality.
```

### Impact
- **Current:** No impact, works fine
- **Future:** Will break in Expo SDK 54+

### Affected File
- `src/services/soundManager.ts`

### Fix (When Ready)

**Step 1:** Install new package
```bash
npx expo install expo-audio
```

**Step 2:** Update import in `soundManager.ts`
```typescript
// Old (deprecated):
import { Audio } from 'expo-av';

// New:
import { Audio } from 'expo-audio';
```

**Step 3:** Update sound loading (API is similar but check docs)
```typescript
// The API is mostly the same, just from new package
const { sound } = await Audio.Sound.createAsync(source);
```

**Reference:** https://docs.expo.dev/versions/latest/sdk/audio/

---

## 2. SafeAreaView Deprecation Warning

### Warning Message
```
WARN SafeAreaView has been deprecated and will be removed in a future release.
Please use 'react-native-safe-area-context' instead.
```

### Impact
- **Current:** No impact, works fine
- **Future:** Will be removed in future React Native versions

### Affected Files
All Friends screens already use the **correct** import:
- ✅ `src/screens/FriendsScreen.tsx`
- ✅ `src/screens/FriendsInboxScreen.tsx`
- ✅ `src/screens/FriendsListScreen.tsx`
- ✅ `src/screens/FriendsLeaderboardScreen.tsx`

All use: `import { SafeAreaView } from 'react-native-safe-area-context';`

### Likely Source
The warning is probably coming from other existing screens in your app.

### Fix (When Ready)

Search for old imports:
```bash
grep -r "from 'react-native'" src/screens/*.tsx | grep SafeAreaView
```

Replace with:
```typescript
// Old (deprecated):
import { SafeAreaView } from 'react-native';

// New (correct):
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Already installed:** You already have `react-native-safe-area-context` installed, just need to update imports.

---

## Priority

### 🟢 Low Priority (Both Warnings)
- App works perfectly as-is
- Only affects future SDK versions
- Can be fixed during next major refactor

### 🟡 Medium Priority (Before SDK 54)
- If planning to upgrade to Expo SDK 54+, fix before upgrading
- Estimated time: 30 minutes

### 🔴 High Priority
- None currently

---

## Friends Feature Status

✅ **Friends feature is NOT affected by these warnings**
- All Friends screens use correct SafeAreaView import
- Friends feature doesn't use audio

The warnings are from existing app code, not the new Friends feature.

---

## Recommendation

**Option A (Recommended):** Ignore for now, fix during next maintenance cycle
**Option B:** Fix immediately if you have time and want a clean console

Both options are fine - the app works either way!

---

**Date:** 2025-01-01
**Status:** ⚠️ Documented, Low Priority
