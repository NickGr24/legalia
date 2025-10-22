# Friends Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Apply Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20250101000000_create_friendships.sql`
4. Copy and paste the entire content
5. Click **Run**
6. Verify success:
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename = 'friendships';
   ```
   You should see `friendships` in the results.

### Step 2: Verify RLS Policies

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'friendships';
-- rowsecurity should be true

-- Check policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'friendships';
-- You should see 4-5 policies
```

### Step 3: Test the Migration

```sql
-- Try to insert a test friendship (replace with real user IDs)
-- Get user IDs first:
SELECT id, email FROM auth.users LIMIT 2;

-- Insert test friendship (replace USER_ID_1 and USER_ID_2)
INSERT INTO public.friendships (requester_id, addressee_id, status)
VALUES ('USER_ID_1', 'USER_ID_2', 'pending')
RETURNING *;

-- Query it back
SELECT * FROM public.friendships WHERE requester_id = 'USER_ID_1';

-- Clean up test data
DELETE FROM public.friendships WHERE requester_id = 'USER_ID_1';
```

### Step 4: Seed Test Data (Optional)

```sql
-- Create 20 random friendships for testing
SELECT * FROM create_random_friendships(20);

-- View all friendships
SELECT
  f.id,
  f.status,
  requester.email as requester,
  addressee.email as addressee,
  f.created_at
FROM public.friendships f
JOIN auth.users requester ON f.requester_id = requester.id
JOIN auth.users addressee ON f.addressee_id = addressee.id
ORDER BY f.created_at DESC
LIMIT 10;
```

### Step 5: Run the App

```bash
# Install dependencies (if not done already)
npm install

# Start the development server
npm start

# Or platform-specific
npm run android
npm run ios
npm run web
```

---

## 🧪 Quick Test (5 minutes)

### Test 1: Send Friend Request

1. Log in as **User A**
2. Navigate to another user's profile (or use FriendRequestButton with target user ID)
3. Click **"Adaugă prieten"**
4. Button should change to **"Cerere trimisă"**

### Test 2: Accept Friend Request

1. Log in as **User B** (the user who received the request)
2. Navigate to **Friends Inbox** (or wherever you integrated it)
3. Go to **"Primite"** tab
4. See request from User A
5. Click **"Acceptă"**
6. Request disappears

### Test 3: View Friends List

1. Still logged in as **User B**
2. Navigate to **Friends List**
3. See User A in the list
4. Stats show "1 prieten"

### Test 4: Friends Leaderboard

1. Navigate to **Friends Leaderboard**
2. See User A and User B (assuming both have quiz scores)
3. Verify ranking is correct

### Test 5: Unfriend

1. In **Friends List**, tap on User A
2. Card expands
3. Click **"Elimină prieten"**
4. Confirm in alert dialog
5. User A disappears from list

---

## 📱 Integration Options

### Option A: Add Friends Tab to Tab Navigator

**File:** `src/navigation/TabNavigator.tsx`

```tsx
import { FriendsScreen } from '../screens/FriendsScreen';

// Inside TabNavigator
<Tab.Screen
  name="Friends"
  component={FriendsScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="people" size={size} color={color} />
    ),
    tabBarLabel: 'Prieteni',
  }}
/>
```

### Option B: Add to Burger Menu

**File:** Wherever you define burger menu items

```tsx
{
  title: 'Prieteni',
  icon: 'people',
  onPress: () => navigation.navigate('FriendsInbox'),
}
```

### Option C: Add to Profile Screen

**File:** `src/screens/ProfileScreen.tsx`

```tsx
<TouchableOpacity onPress={() => navigation.navigate('FriendsInbox')}>
  <Text>Vezi prieteni</Text>
</TouchableOpacity>
```

---

## 🔍 Debugging

### Check if Migration Applied

```sql
-- Check table exists
SELECT * FROM pg_tables WHERE tablename = 'friendships';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'friendships';

-- Check constraints
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.friendships'::regclass;
```

### Check RLS Policies

```sql
-- List all policies
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'friendships';
```

### Test RLS Security

```sql
-- Simulate user A querying friendships
SET request.jwt.claim.sub = 'USER_A_ID';
SELECT * FROM public.friendships; -- Should only see User A's friendships

-- Simulate user B querying friendships
SET request.jwt.claim.sub = 'USER_B_ID';
SELECT * FROM public.friendships; -- Should only see User B's friendships
```

### Check Logs in Console

In your React Native app:

```tsx
// Enable detailed logging
import { telemetryService } from '@/services/telemetryService';

// All friend actions will log to console in dev mode
// Look for: [Telemetry] friends.request_sent { ... }
```

### Common Issues

#### Issue: "Table doesn't exist"
**Solution:** Migration not applied. Run migration in Supabase SQL Editor.

#### Issue: "Permission denied"
**Solution:** RLS blocking access. Check if user is authenticated and RLS policies are correct.

#### Issue: "Duplicate key value violates unique constraint"
**Solution:** Friendship already exists. Check existing friendships first.

#### Issue: "Cannot read properties of undefined"
**Solution:** Check that all imports are correct and hook is being called inside component.

---

## 📊 Monitoring

### View Friendship Statistics

```sql
-- Total friendships by status
SELECT status, COUNT(*) FROM public.friendships GROUP BY status;

-- Users with most friends
SELECT u.email, COUNT(*) as friend_count
FROM (
  SELECT requester_id as user_id FROM public.friendships WHERE status = 'accepted'
  UNION ALL
  SELECT addressee_id as user_id FROM public.friendships WHERE status = 'accepted'
) f
JOIN auth.users u ON f.user_id = u.id
GROUP BY u.email
ORDER BY friend_count DESC
LIMIT 10;

-- Recent friend requests
SELECT
  f.created_at,
  f.status,
  r.email as requester,
  a.email as addressee
FROM public.friendships f
JOIN auth.users r ON f.requester_id = r.id
JOIN auth.users a ON f.addressee_id = a.id
ORDER BY f.created_at DESC
LIMIT 20;
```

### Check Telemetry Events

In your app console (dev mode):

```
[Telemetry] friends.request_sent { user_id: '...', target_id: '...', ... }
[Telemetry] friends.request_accept { user_id: '...', request_id: '...', ... }
```

---

## 🎯 Next Steps

1. **Run QA Tests:** Follow `docs/FRIENDS_QA_CHECKLIST.md`
2. **Customize UI:** Adjust colors, fonts, spacing to match your design
3. **Add to Navigation:** Choose integration option (Tab, Burger Menu, etc.)
4. **Test Performance:** With 100+ friends, verify leaderboard loads < 300ms
5. **Set Up Sentry:** Integrate telemetry with Sentry for production monitoring
6. **Deploy:** Push to production after QA sign-off

---

## 📚 Documentation Links

- **Full Feature Documentation:** `docs/FRIENDS_FEATURE.md`
- **QA Checklist:** `docs/FRIENDS_QA_CHECKLIST.md`
- **Implementation Summary:** `FRIENDS_IMPLEMENTATION_SUMMARY.md`
- **Database Migration:** `supabase/migrations/20250101000000_create_friendships.sql`
- **Test Data Script:** `scripts/seed-friends-test-data.sql`

---

## 💡 Pro Tips

1. **Test with multiple devices/emulators** to verify cross-user interactions
2. **Use Supabase Dashboard** to view real-time data changes
3. **Check console logs** for telemetry events during testing
4. **Run cleanup script** after testing to remove test data:
   ```sql
   SELECT cleanup_test_friendships();
   ```
5. **Monitor database performance** with Supabase's performance insights

---

## ✅ Checklist

- [ ] Database migration applied
- [ ] RLS policies verified
- [ ] Test data seeded
- [ ] App running locally
- [ ] Sent friend request successfully
- [ ] Accepted friend request successfully
- [ ] Viewed friends list
- [ ] Viewed friends leaderboard
- [ ] Unfriended successfully
- [ ] Telemetry events logging
- [ ] Romanian strings verified
- [ ] Integration with navigation complete

---

**Ready to go! 🚀**

For issues or questions, check the full documentation or QA checklist.
