# Friends Feature Documentation

## Overview

The Friends feature enables Legalia users to connect with each other, compare scores, and compete in a social learning environment. It implements a two-way friendship model with request/accept/decline flow and includes a friends-only leaderboard.

All user-facing content is in **Romanian** 🇷🇴.

---

## Architecture

### Tech Stack
- **Frontend:** React Native (Expo), TypeScript
- **Backend:** Supabase (PostgreSQL, RLS, Auth)
- **State Management:** React hooks (`useFriends`)
- **Navigation:** React Navigation (Stack + Tabs)

### Data Flow
```
User Action → useFriends Hook → FriendsService → Supabase (RLS) → PostgreSQL
                    ↓
              Optimistic UI Update
                    ↓
              Telemetry Logging
```

---

## Database Schema

### Table: `public.friendships`

```sql
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_friendship CHECK (requester_id != addressee_id)
);
```

### Indexes
- `idx_friendships_requester` (requester_id)
- `idx_friendships_addressee` (addressee_id)
- `idx_friendships_status` (status)
- `idx_friendships_requester_status` (requester_id, status)
- `idx_friendships_addressee_status` (addressee_id, status)
- `idx_friendships_unique_pending_accepted` (unique partial index to prevent duplicates)

### Row Level Security (RLS)

**Policies:**

1. **SELECT:** Users can view friendships they are part of
   ```sql
   auth.uid() = requester_id OR auth.uid() = addressee_id
   ```

2. **INSERT:** Users can create friend requests where they are the requester
   ```sql
   auth.uid() = requester_id
   ```

3. **UPDATE:**
   - Addressee can accept/decline pending requests
   - Either party can unfriend (accepted → declined)
   ```sql
   (auth.uid() = addressee_id AND status = 'pending') OR
   ((auth.uid() = requester_id OR auth.uid() = addressee_id) AND status = 'accepted')
   ```

4. **DELETE:** Either party can delete friendship records
   ```sql
   auth.uid() = requester_id OR auth.uid() = addressee_id
   ```

---

## API Layer

### Service: `FriendsService`

Location: `src/services/friendsService.ts`

#### Methods

##### `sendFriendRequest(targetUserId: string): Promise<Friendship>`
Sends a friend request to another user.

**Throws:**
- `SELF_FRIEND_REQUEST` - Cannot send request to self
- `ALREADY_FRIENDS` - Users are already friends
- `REQUEST_PENDING` - Request already exists
- `DUPLICATE_REQUEST` - Unique constraint violation

**Example:**
```typescript
const friendship = await friendsService.sendFriendRequest('user-id-123');
```

##### `respondToFriendRequest(requestId: string, action: 'accept' | 'decline'): Promise<Friendship>`
Accept or decline a pending friend request.

**Example:**
```typescript
await friendsService.respondToFriendRequest('request-id', 'accept');
```

##### `getFriends(userId?: string): Promise<Friend[]>`
Get list of accepted friends for a user.

##### `getPendingIncoming(): Promise<FriendRequest[]>`
Get pending incoming friend requests.

##### `getPendingOutgoing(): Promise<FriendRequest[]>`
Get pending outgoing friend requests.

##### `unfriend(friendUserId: string): Promise<void>`
Remove a friendship (updates status to 'declined').

##### `getFriendsLeaderboard(limit: number = 100): Promise<{leaderboard: FriendsLeaderboardEntry[], currentUserRank: number | null}>`
Get friends-only leaderboard with top N entries and current user's rank.

**Performance:** <300ms for 500 friends (per requirements).

##### `getFriendshipStats(): Promise<FriendshipStats>`
Get friendship statistics for current user.

##### `checkFriendshipStatus(targetUserId: string): Promise<{status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends', friendshipId?: string}>`
Check friendship status with another user.

##### `cancelFriendRequest(requestId: string): Promise<void>`
Cancel a pending outgoing friend request.

---

## React Hooks

### `useFriends()`

Location: `src/hooks/useFriends.ts`

Custom hook for managing friendship state with optimistic updates.

**Returns:**
```typescript
{
  // Data
  friends: Friend[];
  pendingIncoming: FriendRequest[];
  pendingOutgoing: FriendRequest[];
  stats: FriendshipStats | null;
  leaderboard: FriendsLeaderboardEntry[];
  currentUserRank: number | null;

  // Loading states
  loading: boolean;
  loadingFriends: boolean;
  loadingRequests: boolean;
  loadingStats: boolean;
  loadingLeaderboard: boolean;

  // Error states
  error: string | null;
  friendsError: string | null;
  requestsError: string | null;
  statsError: string | null;
  leaderboardError: string | null;

  // Actions
  sendFriendRequest: (targetUserId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  unfriend: (friendUserId: string) => Promise<boolean>;
  cancelFriendRequest: (requestId: string) => Promise<boolean>;
  checkFriendshipStatus: (targetUserId: string) => Promise<...>;

  // Refresh functions
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
}
```

**Features:**
- Optimistic UI updates with rollback on error
- Automatic initial data load
- Error handling with Romanian messages
- Loading state management

---

## UI Components

### Screens

#### 1. **FriendsScreen** (Hub)
- Location: `src/screens/FriendsScreen.tsx`
- Route: `Friends` (Tab Navigator)
- Purpose: Main hub with navigation to all friends features
- Features:
  - Stats card (total friends, pending incoming, pending outgoing)
  - Menu cards for Inbox, List, and Leaderboard
  - Info card with feature description

#### 2. **FriendsInboxScreen**
- Location: `src/screens/FriendsInboxScreen.tsx`
- Route: `FriendsInbox`
- Purpose: View and manage friend requests
- Features:
  - Tabs: "Primite" (Incoming) / "Trimise" (Outgoing)
  - Accept/Decline buttons for incoming
  - Cancel button for outgoing
  - Empty states with Romanian messages
  - Pull-to-refresh

#### 3. **FriendsListScreen**
- Location: `src/screens/FriendsListScreen.tsx`
- Route: `FriendsList`
- Purpose: View and manage accepted friends
- Features:
  - Stats card
  - Expandable friend cards
  - Unfriend action
  - Empty state: "Nu ai încă prieteni. Trimite o cerere și începe competiția!"
  - Pull-to-refresh

#### 4. **FriendsLeaderboardScreen**
- Location: `src/screens/FriendsLeaderboardScreen.tsx`
- Route: `FriendsLeaderboard`
- Purpose: Friends-only leaderboard
- Features:
  - Podium for top 3
  - Ranked list with score, quizzes completed, streak
  - Current user highlighted (blue border)
  - "Rangul tău" section if user outside top 100
  - Empty state
  - Pull-to-refresh

### Components

#### **FriendRequestButton**
- Location: `src/components/FriendRequestButton.tsx`
- Purpose: Button for managing friend requests from other user profiles
- Props:
  ```typescript
  {
    targetUserId: string;
    onStatusChange?: (status) => void;
    style?: ViewStyle;
    compact?: boolean;
  }
  ```
- States:
  - **none:** "Adaugă prieten" (primary)
  - **pending_outgoing:** "Cerere trimisă" (pending, can cancel)
  - **pending_incoming:** "Răspunde la cerere" (navigate to inbox)
  - **friends:** "Sunteți prieteni" (disabled)
  - **loading:** Shows spinner

---

## Navigation

### Routes Added

**RootStackParamList:**
```typescript
{
  FriendsInbox: undefined;
  FriendsList: undefined;
  FriendsLeaderboard: undefined;
}
```

**TabParamList:**
```typescript
{
  Friends: undefined;
}
```

### Integration
- Friends screens added to `RootNavigator.tsx`
- Optional: Add Friends tab to `TabNavigator.tsx`
- Navigation uses slide-from-right animation
- Headers include BurgerButton for menu access

---

## Telemetry & Logging

### Service: `TelemetryService`

Location: `src/services/telemetryService.ts`

#### Events

| Event Name | Data | Trigger |
|------------|------|---------|
| `friends.request_sent` | `user_id, target_id, screen` | Friend request sent |
| `friends.request_accept` | `user_id, request_id, screen` | Friend request accepted |
| `friends.request_decline` | `user_id, request_id, screen` | Friend request declined |
| `friends.unfriend` | `user_id, target_id, screen` | User unfriended |
| `friends.lb_view` | `user_id, friends_count` | Friends leaderboard viewed |
| `friends.inbox_view` | `user_id, pending_count` | Friends inbox viewed |
| `friends.list_view` | `user_id, friends_count` | Friends list viewed |
| `friends.error` | `user_id, error_message, error_code, context` | Error occurred |

#### Integration
- Console logging in development
- Ready for Sentry integration
- No PII values logged

---

## Romanian UI Strings

### Buttons
- `Adaugă prieten` - Add friend
- `Cerere trimisă` - Request sent
- `Acceptă` - Accept
- `Respinge` - Decline
- `Anulează` - Cancel
- `Elimină prieten` - Remove friend

### Headers
- `Prieteni` - Friends
- `Cereri de prietenie` - Friend requests
- `Lista de prieteni` - Friends list
- `Clasament prieteni` - Friends leaderboard

### Tabs
- `Primite` - Received (incoming)
- `Trimise` - Sent (outgoing)

### Empty States
- `Nu ai încă prieteni` - No friends yet
- `Nu ai cereri de prietenie primite` - No incoming requests
- `Nu ai cereri de prietenie trimise` - No outgoing requests
- `Trimite o cerere și începe competiția!` - Send a request and start competing!

### Error Messages
- `Nu poți trimite cerere de prietenie către tine însuți` - Can't send request to self
- `Sunteți deja prieteni` - Already friends
- `Cerere de prietenie în așteptare` - Request pending
- `Eroare la trimiterea cererii de prietenie` - Error sending request
- `Eroare la încărcarea prietenilor` - Error loading friends

### Alerts
- `Respinge cererea?` - Decline request?
- `Sigur vrei să respingi această cerere de prietenie?` - Sure you want to decline?
- `Anulează cererea?` - Cancel request?
- `Elimină prieten?` - Remove friend?

---

## Testing

### Test Data Seeding

**Script:** `scripts/seed-friends-test-data.sql`

**Functions:**
- `create_random_friendships(count INTEGER)` - Create random test friendships
- `cleanup_test_friendships()` - Remove test data created in last 24 hours

**Usage:**
```sql
-- Create 20 random friendships
SELECT * FROM create_random_friendships(20);

-- Cleanup test data
SELECT cleanup_test_friendships();
```

### QA Checklist

**Document:** `docs/FRIENDS_QA_CHECKLIST.md`

**Coverage:**
- 26 test sections
- Functional tests (send, accept, decline, unfriend)
- Edge cases (duplicates, self-requests, RLS)
- Performance tests (500 friends, <300ms)
- UI/UX tests (Romanian strings, responsive design)
- Integration tests
- Database integrity tests

---

## Performance Considerations

### Optimization Strategies

1. **Database Indexes**
   - Composite indexes for common queries
   - Partial unique index for duplicate prevention

2. **Query Optimization**
   - Limit leaderboard to top 100
   - Aggregate scores efficiently
   - Use `in()` queries for batch fetching

3. **Client-Side**
   - Optimistic updates for instant feedback
   - Debouncing for rapid actions
   - Pagination for large friend lists (if needed)

4. **Caching** (future enhancement)
   - Cache friendship status checks
   - Cache leaderboard for 5 minutes
   - Invalidate on friend actions

### Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Friends leaderboard (500 friends) | <300ms | TBD |
| Friend request send | <500ms | TBD |
| Friends list load (100 friends) | <2s | TBD |
| Scroll performance | 60 FPS | TBD |

---

## Security

### RLS Enforcement

- ✅ Users can only view their own friendships
- ✅ Users cannot modify other users' friendship records
- ✅ Requester validation on INSERT
- ✅ Addressee validation on UPDATE
- ✅ No self-friend requests (DB constraint)
- ✅ No duplicate pending/accepted requests (unique index)

### Best Practices

- All database operations go through Supabase with RLS
- No direct SQL from client (except through Supabase client)
- User IDs never exposed in UI (use usernames/emails)
- Error messages don't leak sensitive data
- Telemetry excludes PII

---

## Migration Guide

### Applying the Migration

1. Navigate to Supabase SQL Editor
2. Open `supabase/migrations/20250101000000_create_friendships.sql`
3. Execute the migration
4. Verify:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friendships';
   ```

### Rollback (if needed)

```sql
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP FUNCTION IF EXISTS update_friendships_updated_at CASCADE;
DROP FUNCTION IF EXISTS create_random_friendships CASCADE;
DROP FUNCTION IF EXISTS cleanup_test_friendships CASCADE;
```

---

## Common Issues & Troubleshooting

### Issue: "PGRST116" error
**Cause:** No rows returned from query
**Solution:** Check if friendship exists; this is expected for non-existent friendships

### Issue: Duplicate request error
**Cause:** Unique constraint violation
**Solution:** Check for existing pending/accepted friendship before sending

### Issue: RLS blocks operation
**Cause:** User not authenticated or trying to access other user's data
**Solution:** Verify user is logged in; check RLS policies

### Issue: Leaderboard slow with many friends
**Cause:** Complex aggregation query
**Solution:** Add indexes; consider server-side view/function

### Issue: Empty leaderboard
**Cause:** No friends or no quiz scores
**Solution:** Complete quizzes; add friends

---

## Future Enhancements

### Potential Features

1. **Friend Suggestions**
   - Mutual friends
   - Nearby users (same university)
   - Top performers

2. **Notifications**
   - Push notifications for friend requests
   - Real-time updates via Supabase Realtime

3. **Friend Groups**
   - Study groups
   - Competition leagues

4. **Chat/Messaging**
   - Direct messages
   - Study session coordination

5. **Friend Activity Feed**
   - See when friends complete quizzes
   - Achievements shared

6. **Referral System**
   - Invite friends by email/link
   - Rewards for referrals

---

## API Reference

### TypeScript Types

**Location:** `src/utils/types.ts`

```typescript
type FriendshipStatus = 'pending' | 'accepted' | 'declined';

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

interface FriendRequest extends Friendship {
  requester?: UserProfile;
  addressee?: UserProfile;
}

interface Friend {
  friendship_id: string;
  user_id: string;
  username: string;
  email: string;
  profile?: UserProfile;
  mutual_friends_count?: number;
  friend_since: string;
}

interface FriendsLeaderboardEntry {
  user_id: string;
  username: string;
  email: string;
  total_score: number;
  total_quizzes_completed: number;
  current_streak: number;
  rank: number;
  is_current_user: boolean;
  profile?: UserProfile;
}

interface FriendshipStats {
  total_friends: number;
  pending_incoming: number;
  pending_outgoing: number;
  mutual_friends?: number;
}
```

---

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow existing React Native patterns
- All user-facing text in Romanian
- Add telemetry for user actions
- Write error messages for debugging (English OK)

### Pull Request Checklist

- [ ] Migration tested locally
- [ ] RLS policies verified
- [ ] All screens render correctly
- [ ] Romanian strings verified
- [ ] Telemetry events added
- [ ] QA checklist passed
- [ ] No regressions in existing features
- [ ] Documentation updated

---

## Support

For issues or questions:
1. Check this documentation
2. Review QA checklist
3. Check Supabase logs for RLS/query errors
4. Review telemetry logs for user actions
5. Contact development team

---

## Changelog

### Version 1.0.0 (2025-01-01)
- ✅ Initial release
- ✅ Two-way friendship system
- ✅ Friend requests (send/accept/decline)
- ✅ Friends list with unfriend
- ✅ Friends-only leaderboard
- ✅ RLS security policies
- ✅ Telemetry logging
- ✅ Romanian UI
- ✅ Comprehensive QA checklist

---

**End of Documentation**
