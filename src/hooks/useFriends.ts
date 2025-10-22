/**
 * useFriends Hook
 * React hook for managing friendship state and operations
 * Provides optimistic updates and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { friendsService, FriendsServiceError } from '@/services/friendsService';
import type {
  Friend,
  FriendRequest,
  FriendshipStats,
  FriendsLeaderboardEntry,
} from '@/utils/types';

export interface UseFriendsResult {
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
  checkFriendshipStatus: (targetUserId: string) => Promise<{
    status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';
    friendshipId?: string;
  } | null>;

  // Refresh functions
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export function useFriends(): UseFriendsResult {
  // Data state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<FriendRequest[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<FriendRequest[]>([]);
  const [stats, setStats] = useState<FriendshipStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<FriendsLeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Loading states
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Error states
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Computed loading and error
  const loading =
    loadingFriends || loadingRequests || loadingStats || loadingLeaderboard;
  const error =
    friendsError || requestsError || statsError || leaderboardError;

  /**
   * Fetch friends list
   */
  const refreshFriends = useCallback(async () => {
    setLoadingFriends(true);
    setFriendsError(null);
    try {
      const data = await friendsService.getFriends();
      setFriends(data);
    } catch (err) {
      const errorMessage =
        err instanceof FriendsServiceError
          ? err.message
          : 'Eroare la încărcarea prietenilor';
      setFriendsError(errorMessage);
      console.error('useFriends: Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  /**
   * Fetch pending requests (incoming and outgoing)
   */
  const refreshRequests = useCallback(async () => {
    setLoadingRequests(true);
    setRequestsError(null);
    try {
      const [incoming, outgoing] = await Promise.all([
        friendsService.getPendingIncoming(),
        friendsService.getPendingOutgoing(),
      ]);
      setPendingIncoming(incoming);
      setPendingOutgoing(outgoing);
    } catch (err) {
      const errorMessage =
        err instanceof FriendsServiceError
          ? err.message
          : 'Eroare la încărcarea cererilor';
      setRequestsError(errorMessage);
      console.error('useFriends: Error fetching requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  /**
   * Fetch friendship stats
   */
  const refreshStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await friendsService.getFriendshipStats();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof FriendsServiceError
          ? err.message
          : 'Eroare la încărcarea statisticilor';
      setStatsError(errorMessage);
      console.error('useFriends: Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetch friends leaderboard
   */
  const refreshLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);
    setLeaderboardError(null);
    try {
      const { leaderboard: data, currentUserRank: rank } =
        await friendsService.getFriendsLeaderboard(100);
      setLeaderboard(data);
      setCurrentUserRank(rank);
    } catch (err) {
      const errorMessage =
        err instanceof FriendsServiceError
          ? err.message
          : 'Eroare la încărcarea clasamentului';
      setLeaderboardError(errorMessage);
      console.error('useFriends: Error fetching leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshFriends(),
      refreshRequests(),
      refreshStats(),
      refreshLeaderboard(),
    ]);
  }, [refreshFriends, refreshRequests, refreshStats, refreshLeaderboard]);

  /**
   * Send a friend request with optimistic update
   */
  const sendFriendRequest = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      try {
        await friendsService.sendFriendRequest(targetUserId);
        // Refresh outgoing requests
        await refreshRequests();
        await refreshStats();
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof FriendsServiceError
            ? err.message
            : 'Eroare la trimiterea cererii';
        setRequestsError(errorMessage);
        console.error('useFriends: Error sending friend request:', err);
        return false;
      }
    },
    [refreshRequests, refreshStats]
  );

  /**
   * Accept a friend request with optimistic update
   */
  const acceptFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      // Optimistic update
      const request = pendingIncoming.find((r) => r.id === requestId);
      if (request) {
        setPendingIncoming((prev) => prev.filter((r) => r.id !== requestId));
      }

      try {
        await friendsService.respondToFriendRequest(requestId, 'accept');
        // Refresh data
        await Promise.all([refreshFriends(), refreshRequests(), refreshStats()]);
        return true;
      } catch (err) {
        // Rollback optimistic update
        if (request) {
          setPendingIncoming((prev) => [request, ...prev]);
        }
        const errorMessage =
          err instanceof FriendsServiceError
            ? err.message
            : 'Eroare la acceptarea cererii';
        setRequestsError(errorMessage);
        console.error('useFriends: Error accepting friend request:', err);
        return false;
      }
    },
    [pendingIncoming, refreshFriends, refreshRequests, refreshStats]
  );

  /**
   * Decline a friend request with optimistic update
   */
  const declineFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      // Optimistic update
      const request = pendingIncoming.find((r) => r.id === requestId);
      if (request) {
        setPendingIncoming((prev) => prev.filter((r) => r.id !== requestId));
      }

      try {
        await friendsService.respondToFriendRequest(requestId, 'decline');
        // Refresh data
        await Promise.all([refreshRequests(), refreshStats()]);
        return true;
      } catch (err) {
        // Rollback optimistic update
        if (request) {
          setPendingIncoming((prev) => [request, ...prev]);
        }
        const errorMessage =
          err instanceof FriendsServiceError
            ? err.message
            : 'Eroare la respingerea cererii';
        setRequestsError(errorMessage);
        console.error('useFriends: Error declining friend request:', err);
        return false;
      }
    },
    [pendingIncoming, refreshRequests, refreshStats]
  );

  /**
   * Unfriend a user with optimistic update
   */
  const unfriend = useCallback(
    async (friendUserId: string): Promise<boolean> => {
      // Optimistic update
      const friend = friends.find((f) => f.user_id === friendUserId);
      if (friend) {
        setFriends((prev) => prev.filter((f) => f.user_id !== friendUserId));
      }

      try {
        await friendsService.unfriend(friendUserId);
        // Refresh data
        await Promise.all([
          refreshFriends(),
          refreshStats(),
          refreshLeaderboard(),
        ]);
        return true;
      } catch (err) {
        // Rollback optimistic update
        if (friend) {
          setFriends((prev) => [friend, ...prev]);
        }
        const errorMessage =
          err instanceof FriendsServiceError
            ? err.message
            : 'Eroare la eliminarea prietenului';
        setFriendsError(errorMessage);
        console.error('useFriends: Error unfriending:', err);
        return false;
      }
    },
    [friends, refreshFriends, refreshStats, refreshLeaderboard]
  );

  /**
   * Cancel a pending outgoing friend request
   */
  const cancelFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      // Optimistic update
      const request = pendingOutgoing.find((r) => r.id === requestId);
      if (request) {
        setPendingOutgoing((prev) => prev.filter((r) => r.id !== requestId));
      }

      try {
        await friendsService.cancelFriendRequest(requestId);
        // Refresh data
        await Promise.all([refreshRequests(), refreshStats()]);
        return true;
      } catch (err) {
        // Rollback optimistic update
        if (request) {
          setPendingOutgoing((prev) => [request, ...prev]);
        }
        const errorMessage =
          err instanceof FriendsServiceError
            ? err.message
            : 'Eroare la anularea cererii';
        setRequestsError(errorMessage);
        console.error('useFriends: Error canceling friend request:', err);
        return false;
      }
    },
    [pendingOutgoing, refreshRequests, refreshStats]
  );

  /**
   * Check friendship status with another user
   */
  const checkFriendshipStatus = useCallback(
    async (
      targetUserId: string
    ): Promise<{
      status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';
      friendshipId?: string;
    } | null> => {
      try {
        return await friendsService.checkFriendshipStatus(targetUserId);
      } catch (err) {
        console.error('useFriends: Error checking friendship status:', err);
        return null;
      }
    },
    []
  );

  // Initial data load
  useEffect(() => {
    refreshAll();
  }, []);

  return {
    // Data
    friends,
    pendingIncoming,
    pendingOutgoing,
    stats,
    leaderboard,
    currentUserRank,

    // Loading states
    loading,
    loadingFriends,
    loadingRequests,
    loadingStats,
    loadingLeaderboard,

    // Error states
    error,
    friendsError,
    requestsError,
    statsError,
    leaderboardError,

    // Actions
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    unfriend,
    cancelFriendRequest,
    checkFriendshipStatus,

    // Refresh functions
    refreshFriends,
    refreshRequests,
    refreshStats,
    refreshLeaderboard,
    refreshAll,
  };
}

export default useFriends;
