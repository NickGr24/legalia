/**
 * Friends Service
 * Handles all friendship-related operations with Supabase
 * Implements two-way friendship model with request/accept/decline flow
 */

import { supabase } from './supabaseClient';
import { telemetryService } from './telemetryService';
import type {
  Friendship,
  FriendRequest,
  Friend,
  FriendsLeaderboardEntry,
  FriendshipStats,
  UserProfile,
} from '@/utils/types';

export class FriendsServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FriendsServiceError';
  }
}

class FriendsService {
  /**
   * Send a friend request to another user
   * @throws {FriendsServiceError} If request fails or duplicate exists
   */
  async sendFriendRequest(targetUserId: string): Promise<Friendship> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      // Prevent self-friend request (additional client-side check)
      if (user.id === targetUserId) {
        throw new FriendsServiceError(
          'Nu poți trimite cerere de prietenie către tine însuți',
          'SELF_FRIEND_REQUEST'
        );
      }

      // Check if friendship already exists (in either direction)
      const { data: existing, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
        )
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new FriendsServiceError(
          'Eroare la verificarea prieteniei existente',
          'CHECK_FAILED',
          checkError
        );
      }

      if (existing) {
        if (existing.status === 'accepted') {
          throw new FriendsServiceError(
            'Sunteți deja prieteni',
            'ALREADY_FRIENDS'
          );
        } else if (existing.status === 'pending') {
          throw new FriendsServiceError(
            'Cerere de prietenie în așteptare',
            'REQUEST_PENDING'
          );
        }
      }

      // Create new friend request
      const { data: friendship, error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          throw new FriendsServiceError(
            'Cerere de prietenie deja trimisă',
            'DUPLICATE_REQUEST',
            insertError
          );
        }
        throw new FriendsServiceError(
          'Eroare la trimiterea cererii de prietenie',
          'INSERT_FAILED',
          insertError
        );
      }

      if (!friendship) {
        throw new FriendsServiceError(
          'Cererea nu a fost creată',
          'NO_DATA_RETURNED'
        );
      }

      // Log telemetry
      telemetryService.logFriendRequestSent(user.id, targetUserId);

      return friendship as Friendship;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code,
          { target_id: targetUserId }
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la trimiterea cererii',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code,
        { target_id: targetUserId }
      );
      throw wrappedError;
    }
  }

  /**
   * Respond to a friend request (accept or decline)
   * @throws {FriendsServiceError} If response fails or request not found
   */
  async respondToFriendRequest(
    requestId: string,
    action: 'accept' | 'decline'
  ): Promise<Friendship> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const newStatus = action === 'accept' ? 'accepted' : 'declined';

      // Update the request status
      const { data: friendship, error: updateError } = await supabase
        .from('friendships')
        .update({ status: newStatus })
        .eq('id', requestId)
        .eq('addressee_id', user.id) // Ensure user is the addressee
        .eq('status', 'pending') // Only update if still pending
        .select()
        .single();

      if (updateError) {
        throw new FriendsServiceError(
          `Eroare la ${action === 'accept' ? 'acceptarea' : 'respingerea'} cererii`,
          'UPDATE_FAILED',
          updateError
        );
      }

      if (!friendship) {
        throw new FriendsServiceError(
          'Cererea nu a fost găsită sau nu poate fi actualizată',
          'REQUEST_NOT_FOUND'
        );
      }

      // Log telemetry
      if (action === 'accept') {
        telemetryService.logFriendRequestAccept(user.id, requestId);
      } else {
        telemetryService.logFriendRequestDecline(user.id, requestId);
      }

      return friendship as Friendship;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code,
          { request_id: requestId, action }
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la răspunsul la cerere',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code,
        { request_id: requestId, action }
      );
      throw wrappedError;
    }
  }

  /**
   * Get accepted friends for a user
   */
  async getFriends(userId?: string): Promise<Friend[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const targetUserId = userId || user.id;

      // Get all accepted friendships where user is involved
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`);

      if (friendshipsError) {
        throw new FriendsServiceError(
          'Eroare la încărcarea prietenilor',
          'FETCH_FAILED',
          friendshipsError
        );
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Extract friend user IDs
      const friendUserIds = friendships.map((f) =>
        f.requester_id === targetUserId ? f.addressee_id : f.requester_id
      );

      // Fetch user profiles using auth.users metadata
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendUserIds);

      // If profiles table doesn't exist, fall back to auth metadata
      let userProfiles: UserProfile[] = [];
      if (profilesError || !profiles) {
        // Fetch basic user info from auth (email only)
        const profilePromises = friendUserIds.map(async (id) => {
          const { data } = await supabase.auth.admin.getUserById(id);
          return data.user
            ? {
                id: data.user.id,
                email: data.user.email || '',
                username: data.user.email?.split('@')[0],
              }
            : null;
        });
        const resolvedProfiles = await Promise.all(profilePromises);
        userProfiles = resolvedProfiles.filter((p) => p !== null) as UserProfile[];
      } else {
        userProfiles = profiles as UserProfile[];
      }

      // Map friendships to Friend objects
      const friends: Friend[] = friendships.map((friendship) => {
        const friendUserId =
          friendship.requester_id === targetUserId
            ? friendship.addressee_id
            : friendship.requester_id;
        const profile = userProfiles.find((p) => p.id === friendUserId);

        return {
          friendship_id: friendship.id,
          user_id: friendUserId,
          username: profile?.username || profile?.email?.split('@')[0] || 'User',
          email: profile?.email || '',
          profile,
          friend_since: friendship.created_at,
        };
      });

      return friends;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code,
          { user_id: userId }
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la încărcarea prietenilor',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code,
        { user_id: userId }
      );
      throw wrappedError;
    }
  }

  /**
   * Get pending incoming friend requests
   */
  async getPendingIncoming(): Promise<FriendRequest[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new FriendsServiceError(
          'Eroare la încărcarea cererilor primite',
          'FETCH_FAILED',
          error
        );
      }

      // Enrich with requester profile data
      const enrichedRequests = await this.enrichRequestsWithProfiles(
        requests || []
      );

      return enrichedRequests;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la încărcarea cererilor',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code
      );
      throw wrappedError;
    }
  }

  /**
   * Get pending outgoing friend requests
   */
  async getPendingOutgoing(): Promise<FriendRequest[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const { data: requests, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new FriendsServiceError(
          'Eroare la încărcarea cererilor trimise',
          'FETCH_FAILED',
          error
        );
      }

      // Enrich with addressee profile data
      const enrichedRequests = await this.enrichRequestsWithProfiles(
        requests || []
      );

      return enrichedRequests;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la încărcarea cererilor trimise',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code
      );
      throw wrappedError;
    }
  }

  /**
   * Unfriend a user (set friendship to declined or delete)
   */
  async unfriend(friendUserId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      // Find the friendship record (in either direction)
      const { data: friendship, error: findError } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${user.id})`
        )
        .maybeSingle();

      if (findError) {
        throw new FriendsServiceError(
          'Eroare la căutarea prieteniei',
          'FIND_FAILED',
          findError
        );
      }

      if (!friendship) {
        throw new FriendsServiceError(
          'Prietenia nu a fost găsită',
          'FRIENDSHIP_NOT_FOUND'
        );
      }

      // Option 1: Update to declined (keeps history)
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendship.id);

      // Option 2: Delete (uncomment to use delete instead)
      // const { error: deleteError } = await supabase
      //   .from('friendships')
      //   .delete()
      //   .eq('id', friendship.id);

      if (updateError) {
        throw new FriendsServiceError(
          'Eroare la eliminarea prietenului',
          'UNFRIEND_FAILED',
          updateError
        );
      }

      // Log telemetry
      telemetryService.logUnfriend(user.id, friendUserId);
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code,
          { friend_id: friendUserId }
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la eliminarea prietenului',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code,
        { friend_id: friendUserId }
      );
      throw wrappedError;
    }
  }

  /**
   * Get friends-only leaderboard
   * Shows top friends + current user's rank if outside top limit
   */
  async getFriendsLeaderboard(
    limit: number = 100
  ): Promise<{
    leaderboard: FriendsLeaderboardEntry[];
    currentUserRank: number | null;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      // Get friends
      const friends = await this.getFriends();
      const friendIds = friends.map((f) => f.user_id);
      const allUserIds = [...friendIds, user.id]; // Include current user

      if (allUserIds.length === 1) {
        // Only current user, no friends
        telemetryService.logFriendsLeaderboardView(user.id, 0);
        return { leaderboard: [], currentUserRank: null };
      }

      // Get scores for all users (friends + self)
      // Aggregate from home_marks_of_user table
      const { data: scores, error: scoresError } = await supabase
        .from('home_marks_of_user')
        .select('user_id, marks_obtained')
        .in('user_id', allUserIds);

      if (scoresError) {
        throw new FriendsServiceError(
          'Eroare la încărcarea scorurilor',
          'SCORES_FETCH_FAILED',
          scoresError
        );
      }

      // Aggregate scores by user
      const userScores = new Map<string, number>();
      const userQuizCounts = new Map<string, number>();

      (scores || []).forEach((record) => {
        const currentScore = userScores.get(record.user_id) || 0;
        const currentCount = userQuizCounts.get(record.user_id) || 0;
        userScores.set(record.user_id, currentScore + (record.marks_obtained || 0));
        userQuizCounts.set(record.user_id, currentCount + 1);
      });

      // Get streaks for all users
      const { data: streaks, error: streaksError } = await supabase
        .from('home_userstreak')
        .select('user_id, current_streak')
        .in('user_id', allUserIds);

      const userStreaks = new Map<string, number>();
      (streaks || []).forEach((record) => {
        userStreaks.set(record.user_id, record.current_streak || 0);
      });

      // Build leaderboard entries
      const entries: FriendsLeaderboardEntry[] = allUserIds.map((userId) => {
        const friend = friends.find((f) => f.user_id === userId);
        const isCurrentUser = userId === user.id;

        return {
          user_id: userId,
          username: isCurrentUser
            ? 'Tu'
            : friend?.username || friend?.email?.split('@')[0] || 'User',
          email: isCurrentUser ? user.email || '' : friend?.email || '',
          total_score: userScores.get(userId) || 0,
          total_quizzes_completed: userQuizCounts.get(userId) || 0,
          current_streak: userStreaks.get(userId) || 0,
          rank: 0, // Will be calculated next
          is_current_user: isCurrentUser,
          profile: friend?.profile,
        };
      });

      // Sort by total_score descending
      entries.sort((a, b) => b.total_score - a.total_score);

      // Assign ranks
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Find current user's rank
      const currentUserEntry = entries.find((e) => e.is_current_user);
      const currentUserRank = currentUserEntry?.rank || null;

      // Take top N entries
      const topEntries = entries.slice(0, limit);

      // If current user is not in top N, include them at the end
      let leaderboard = topEntries;
      if (
        currentUserEntry &&
        currentUserRank &&
        currentUserRank > limit &&
        !topEntries.find((e) => e.is_current_user)
      ) {
        leaderboard = [...topEntries, currentUserEntry];
      }

      // Log telemetry
      telemetryService.logFriendsLeaderboardView(user.id, friends.length);

      return { leaderboard, currentUserRank };
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        telemetryService.logError(
          (await supabase.auth.getUser()).data.user?.id,
          error.message,
          error.code
        );
        throw error;
      }
      const wrappedError = new FriendsServiceError(
        'Eroare neașteptată la încărcarea clasamentului',
        'UNKNOWN_ERROR',
        error
      );
      telemetryService.logError(
        (await supabase.auth.getUser()).data.user?.id,
        wrappedError.message,
        wrappedError.code
      );
      throw wrappedError;
    }
  }

  /**
   * Get friendship stats for current user
   */
  async getFriendshipStats(): Promise<FriendshipStats> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('status')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) {
        throw new FriendsServiceError(
          'Eroare la încărcarea statisticilor',
          'STATS_FETCH_FAILED',
          error
        );
      }

      const stats: FriendshipStats = {
        total_friends: 0,
        pending_incoming: 0,
        pending_outgoing: 0,
      };

      (friendships || []).forEach((f) => {
        if (f.status === 'accepted') {
          stats.total_friends++;
        }
      });

      // Get pending counts
      const incoming = await this.getPendingIncoming();
      const outgoing = await this.getPendingOutgoing();

      stats.pending_incoming = incoming.length;
      stats.pending_outgoing = outgoing.length;

      return stats;
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        throw error;
      }
      throw new FriendsServiceError(
        'Eroare neașteptată la încărcarea statisticilor',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Check friendship status with another user
   */
  async checkFriendshipStatus(
    targetUserId: string
  ): Promise<{
    status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';
    friendshipId?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const { data: friendship, error } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${user.id})`
        )
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new FriendsServiceError(
          'Eroare la verificarea stării prieteniei',
          'CHECK_FAILED',
          error
        );
      }

      if (!friendship) {
        return { status: 'none' };
      }

      if (friendship.status === 'accepted') {
        return { status: 'friends', friendshipId: friendship.id };
      }

      if (friendship.requester_id === user.id) {
        return { status: 'pending_outgoing', friendshipId: friendship.id };
      } else {
        return { status: 'pending_incoming', friendshipId: friendship.id };
      }
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        throw error;
      }
      throw new FriendsServiceError(
        'Eroare neașteptată la verificarea stării',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Helper: Enrich friend requests with user profile data
   */
  private async enrichRequestsWithProfiles(
    requests: any[]
  ): Promise<FriendRequest[]> {
    if (requests.length === 0) return [];

    // Extract unique user IDs
    const requesterIds = requests.map((r) => r.requester_id);
    const addresseeIds = requests.map((r) => r.addressee_id);
    const allUserIds = [...new Set([...requesterIds, ...addresseeIds])];

    // Fetch profiles (or use auth metadata)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', allUserIds);

    // If profiles don't exist, fetch from auth
    let userProfiles: UserProfile[] = [];
    if (!profiles || profiles.length === 0) {
      // Note: admin.getUserById requires service role key, won't work with anon key
      // Fall back to using email from auth.users if possible
      // For now, we'll use placeholder data
      userProfiles = allUserIds.map((id) => ({
        id,
        email: 'user@example.com',
        username: 'User',
      }));
    } else {
      userProfiles = profiles as UserProfile[];
    }

    // Map profiles to requests
    return requests.map((req) => ({
      ...req,
      requester: userProfiles.find((p) => p.id === req.requester_id),
      addressee: userProfiles.find((p) => p.id === req.addressee_id),
    }));
  }

  /**
   * Cancel a pending outgoing friend request
   */
  async cancelFriendRequest(requestId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new FriendsServiceError('User not authenticated', 'AUTH_REQUIRED');
      }

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (error) {
        throw new FriendsServiceError(
          'Eroare la anularea cererii',
          'CANCEL_FAILED',
          error
        );
      }
    } catch (error) {
      if (error instanceof FriendsServiceError) {
        throw error;
      }
      throw new FriendsServiceError(
        'Eroare neașteptată la anularea cererii',
        'UNKNOWN_ERROR',
        error
      );
    }
  }
}

// Export singleton instance
export const friendsService = new FriendsService();
export default friendsService;
