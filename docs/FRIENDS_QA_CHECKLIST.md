# Friends Feature QA Checklist

## Test Environment Setup

### Prerequisites
- [ ] Supabase migration applied successfully (`20250101000000_create_friendships.sql`)
- [ ] At least 3 test user accounts created
- [ ] Test data seeded using `scripts/seed-friends-test-data.sql`
- [ ] App compiled and running on iOS/Android/Web

### Test Users
Create at least 3 test accounts:
- **User A** (Primary test account)
- **User B** (Secondary test account)
- **User C** (Tertiary test account)

---

## Functional Tests

### 1. Friend Request Flow

#### 1.1 Send Friend Request
- [ ] Log in as User A
- [ ] Navigate to another user's profile (User B)
- [ ] Click "Adaugă prieten" button
- [ ] Button changes to "Cerere trimisă"
- [ ] Request appears in User A's outgoing requests
- [ ] Log in as User B
- [ ] Request appears in User B's incoming requests
- [ ] **Expected:** Request sent successfully, both users see it

#### 1.2 Accept Friend Request
- [ ] Log in as User B
- [ ] Navigate to Friends Inbox → Incoming tab
- [ ] See request from User A
- [ ] Click "Acceptă" button
- [ ] Request disappears from inbox
- [ ] User A appears in User B's friends list
- [ ] Log in as User A
- [ ] User B appears in User A's friends list
- [ ] Both appear in each other's friends leaderboard
- [ ] **Expected:** Friendship established, visible to both users

#### 1.3 Decline Friend Request
- [ ] User C sends request to User A
- [ ] Log in as User A
- [ ] Navigate to Friends Inbox → Incoming tab
- [ ] Click "Respinge" on User C's request
- [ ] Confirm decline in alert dialog
- [ ] Request disappears from inbox
- [ ] User C does not appear in friends list
- [ ] **Expected:** Request declined, no friendship created

#### 1.4 Cancel Outgoing Request
- [ ] Log in as User A
- [ ] Send friend request to User C
- [ ] Navigate to Friends Inbox → Outgoing tab
- [ ] See request to User C
- [ ] Click "Anulează" button
- [ ] Confirm cancellation in alert dialog
- [ ] Request disappears from outgoing list
- [ ] Log in as User C
- [ ] Request does not appear in incoming requests
- [ ] **Expected:** Request cancelled successfully

### 2. Friends List

#### 2.1 View Friends List
- [ ] Log in as User A (with 2+ friends)
- [ ] Navigate to Friends List
- [ ] See all accepted friends
- [ ] Each friend shows: avatar, name, email, friend since date
- [ ] Stats card shows correct friend count
- [ ] **Expected:** All friends displayed correctly

#### 2.2 Unfriend
- [ ] Log in as User A
- [ ] Navigate to Friends List
- [ ] Tap on a friend to expand
- [ ] Click "Elimină prieten" button
- [ ] Confirm unfriend in alert dialog
- [ ] Friend disappears from list
- [ ] Log in as that friend's account
- [ ] User A no longer appears in their friends list
- [ ] **Expected:** Unfriend successful, bidirectional removal

#### 2.3 Empty State
- [ ] Create new user account (User D)
- [ ] Navigate to Friends List
- [ ] See empty state message: "Nu ai încă prieteni"
- [ ] **Expected:** Empty state displayed correctly

### 3. Friends Inbox

#### 3.1 Incoming Requests Tab
- [ ] Log in as user with pending incoming requests
- [ ] Navigate to Friends Inbox
- [ ] "Primite" tab selected by default
- [ ] See list of incoming requests
- [ ] Each request shows: requester name, email, date
- [ ] Badge shows correct count
- [ ] **Expected:** Incoming requests displayed correctly

#### 3.2 Outgoing Requests Tab
- [ ] Navigate to Friends Inbox
- [ ] Switch to "Trimise" tab
- [ ] See list of outgoing requests
- [ ] Each request shows: addressee name, email, date
- [ ] Can cancel each request
- [ ] **Expected:** Outgoing requests displayed correctly

#### 3.3 Empty States
- [ ] Navigate to Friends Inbox with no requests
- [ ] Check both tabs
- [ ] See appropriate empty state messages
- [ ] **Expected:** Empty states displayed for both tabs

### 4. Friends Leaderboard

#### 4.1 Leaderboard Display
- [ ] Log in as User A (with 3+ friends)
- [ ] Navigate to Friends Leaderboard
- [ ] See podium with top 3 friends (if ≥3 friends)
- [ ] See ranked list below podium
- [ ] Each entry shows: rank, name, score, quizzes, streak
- [ ] Current user highlighted with blue border
- [ ] **Expected:** Leaderboard displayed correctly

#### 4.2 Current User Rank (Outside Top 100)
- [ ] Create scenario with 100+ friends
- [ ] Log in as user ranked > 100
- [ ] Navigate to Friends Leaderboard
- [ ] See top 100 entries
- [ ] See "Rangul tău" section at bottom
- [ ] See current user's entry with rank
- [ ] **Expected:** User rank displayed even outside top 100

#### 4.3 Empty State
- [ ] Log in as user with no friends
- [ ] Navigate to Friends Leaderboard
- [ ] See empty state: "Niciun prieten încă"
- [ ] **Expected:** Empty state displayed

#### 4.4 Leaderboard Accuracy
- [ ] Verify leaderboard only shows friends + current user
- [ ] Verify scores match actual quiz data
- [ ] Verify ranks are correct (no duplicates, sequential)
- [ ] **Expected:** Data accurate and consistent

### 5. Friend Request Button Component

#### 5.1 Button States
- [ ] Navigate to profile of user with no friendship
- [ ] See "Adaugă prieten" button (primary variant)
- [ ] Send request
- [ ] Button changes to "Cerere trimisă" (pending variant)
- [ ] Accept request from other side
- [ ] Button changes to "Sunteți prieteni" (friends variant, disabled)
- [ ] **Expected:** Button states reflect friendship status

#### 5.2 Pending Incoming State
- [ ] User B sends request to User A
- [ ] Log in as User A
- [ ] Navigate to User B's profile
- [ ] See "Răspunde la cerere" button
- [ ] **Expected:** Button indicates pending incoming request

#### 5.3 Error Handling
- [ ] Try to send request to same user twice
- [ ] See error message
- [ ] Button state remains unchanged
- [ ] **Expected:** Error handled gracefully

---

## Edge Cases & Error Handling

### 6. Duplicate Requests
- [ ] Try to send friend request to user with existing pending request
- [ ] **Expected:** Error message "Cerere de prietenie în așteptare"

### 7. Self-Friend Request
- [ ] Try to send friend request to own user ID (via API call)
- [ ] **Expected:** Error blocked by database constraint

### 8. RLS Security
- [ ] Try to view friendships via API for other users
- [ ] **Expected:** RLS blocks unauthorized access
- [ ] Log in as User A
- [ ] Attempt to modify User B's friendship directly (via SQL)
- [ ] **Expected:** RLS blocks unauthorized update

### 9. Network Errors
- [ ] Disconnect internet
- [ ] Try to send friend request
- [ ] See error message
- [ ] Reconnect internet
- [ ] Retry action
- [ ] **Expected:** Error handled, retry successful

### 10. Loading States
- [ ] Navigate to Friends List with slow connection
- [ ] See loading indicator
- [ ] **Expected:** Loading state displayed
- [ ] Navigate to Friends Leaderboard
- [ ] Pull to refresh
- [ ] See loading indicator during refresh
- [ ] **Expected:** Refresh loading state displayed

### 11. Optimistic Updates
- [ ] Accept friend request
- [ ] **Expected:** UI updates immediately
- [ ] Unfriend a user
- [ ] **Expected:** Friend removed from list immediately
- [ ] If error occurs, UI should rollback
- [ ] **Expected:** Rollback on error works correctly

---

## Performance Tests

### 12. Large Friend Lists
- [ ] Create user with 100+ friends
- [ ] Navigate to Friends List
- [ ] Scroll through list
- [ ] **Expected:** Smooth scrolling, <2s load time

### 13. Friends Leaderboard Performance
- [ ] User with 500 friends
- [ ] Load Friends Leaderboard
- [ ] **Expected:** Loads in <300ms (as per requirements)

### 14. Concurrent Requests
- [ ] Send multiple friend requests rapidly
- [ ] **Expected:** All requests processed correctly

---

## UI/UX Tests

### 15. Romanian Localization
- [ ] Verify all UI text is in Romanian
- [ ] Check: buttons, headers, empty states, error messages
- [ ] **Expected:** No English text visible to user

### 16. Responsive Design
- [ ] Test on iOS (iPhone SE, iPhone 14 Pro)
- [ ] Test on Android (various screen sizes)
- [ ] Test on Web (desktop and mobile browsers)
- [ ] **Expected:** UI adapts correctly to all screen sizes

### 17. Dark Mode (if supported)
- [ ] Enable dark mode
- [ ] Navigate through all Friends screens
- [ ] **Expected:** Colors adapt correctly

### 18. Accessibility
- [ ] Test with screen reader
- [ ] Verify all interactive elements are accessible
- [ ] **Expected:** All actions accessible

---

## Integration Tests

### 19. Navigation Integration
- [ ] Navigate from Home → Friends
- [ ] Navigate from Friends → Inbox
- [ ] Navigate from Friends → List
- [ ] Navigate from Friends → Leaderboard
- [ ] Back navigation works correctly
- [ ] **Expected:** All navigation flows work smoothly

### 20. Leaderboard Integration
- [ ] Complete a quiz
- [ ] Check Friends Leaderboard
- [ ] Verify score updated
- [ ] **Expected:** Quiz scores reflect in friends leaderboard

---

## Telemetry & Logging

### 21. Event Logging
- [ ] Enable dev mode / check console
- [ ] Perform friend actions
- [ ] Verify telemetry events logged:
  - `friends.request_sent`
  - `friends.request_accept`
  - `friends.request_decline`
  - `friends.unfriend`
  - `friends.lb_view`
  - `friends.inbox_view`
  - `friends.list_view`
  - `friends.error`
- [ ] **Expected:** All events logged with correct data

### 22. Error Telemetry
- [ ] Trigger error (e.g., network failure)
- [ ] Verify error logged with context
- [ ] **Expected:** Errors logged with user_id, error_code, message

---

## Database Tests

### 23. Data Integrity
- [ ] Run query to check for duplicate friendships
  ```sql
  SELECT
    LEAST(requester_id, addressee_id) as user1,
    GREATEST(requester_id, addressee_id) as user2,
    COUNT(*) as count
  FROM public.friendships
  WHERE status IN ('pending', 'accepted')
  GROUP BY user1, user2
  HAVING COUNT(*) > 1;
  ```
- [ ] **Expected:** No results (no duplicates)

### 24. RLS Policies
- [ ] Test RLS policies manually:
  ```sql
  -- As User A, try to view User B's friendships
  SET request.jwt.claim.sub = 'USER_A_ID';
  SELECT * FROM public.friendships WHERE requester_id = 'USER_B_ID';
  ```
- [ ] **Expected:** Only sees own friendships

### 25. Cascading Deletes
- [ ] Delete a user account
- [ ] Verify associated friendships are deleted
- [ ] **Expected:** Cascading delete works (ON DELETE CASCADE)

---

## Regression Tests

### 26. Existing Features Unaffected
- [ ] Complete a quiz
- [ ] View leaderboard (all-time, weekly)
- [ ] Check achievements
- [ ] View profile
- [ ] **Expected:** No regressions in existing features

---

## Sign-off

### Test Summary
- **Total Tests:** 26 sections
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

### Critical Issues
List any critical issues found:
1.
2.
3.

### Notes
Additional notes or observations:

---

### Tester Information
- **Tester Name:** ___________________
- **Test Date:** ___________________
- **App Version:** ___________________
- **Platform(s):** iOS / Android / Web
- **Supabase Migration Version:** 20250101000000
