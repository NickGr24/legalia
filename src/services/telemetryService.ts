/**
 * Telemetry Service
 * Structured event logging for analytics and error tracking
 * Supports Sentry, console logging, and future analytics platforms
 */

export type TelemetryEventName =
  | 'friends.request_sent'
  | 'friends.request_accept'
  | 'friends.request_decline'
  | 'friends.unfriend'
  | 'friends.lb_view'
  | 'friends.error'
  | 'friends.inbox_view'
  | 'friends.list_view';

export interface TelemetryEventData {
  user_id?: string;
  target_id?: string;
  request_id?: string;
  screen?: string;
  error_message?: string;
  error_code?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface TelemetryEvent {
  name: TelemetryEventName;
  data: TelemetryEventData;
}

class TelemetryService {
  private enabled: boolean = true;

  /**
   * Log a telemetry event
   * @param eventName - Event name (namespaced with feature prefix)
   * @param data - Event data (no PII values)
   */
  logEvent(eventName: TelemetryEventName, data: TelemetryEventData = {}): void {
    if (!this.enabled) return;

    const event: TelemetryEvent = {
      name: eventName,
      data: {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      },
    };

    // Console logging (development)
    if (__DEV__) {
      console.log('[Telemetry]', event.name, event.data);
    }

    // TODO: Integrate Sentry for production error tracking and breadcrumbs
    // TODO: Add analytics platforms (e.g., Mixpanel, Amplitude) when needed
  }

  /**
   * Log a friend request sent event
   */
  logFriendRequestSent(userId: string, targetId: string, screen?: string): void {
    this.logEvent('friends.request_sent', {
      user_id: userId,
      target_id: targetId,
      screen,
    });
  }

  /**
   * Log a friend request accepted event
   */
  logFriendRequestAccept(userId: string, requestId: string, screen?: string): void {
    this.logEvent('friends.request_accept', {
      user_id: userId,
      request_id: requestId,
      screen,
    });
  }

  /**
   * Log a friend request declined event
   */
  logFriendRequestDecline(userId: string, requestId: string, screen?: string): void {
    this.logEvent('friends.request_decline', {
      user_id: userId,
      request_id: requestId,
      screen,
    });
  }

  /**
   * Log an unfriend event
   */
  logUnfriend(userId: string, targetId: string, screen?: string): void {
    this.logEvent('friends.unfriend', {
      user_id: userId,
      target_id: targetId,
      screen,
    });
  }

  /**
   * Log a friends leaderboard view
   */
  logFriendsLeaderboardView(userId: string, friendsCount: number): void {
    this.logEvent('friends.lb_view', {
      user_id: userId,
      friends_count: friendsCount,
    });
  }

  /**
   * Log a friends inbox view
   */
  logFriendsInboxView(userId: string, pendingCount: number): void {
    this.logEvent('friends.inbox_view', {
      user_id: userId,
      pending_count: pendingCount,
    });
  }

  /**
   * Log a friends list view
   */
  logFriendsListView(userId: string, friendsCount: number): void {
    this.logEvent('friends.list_view', {
      user_id: userId,
      friends_count: friendsCount,
    });
  }

  /**
   * Log a friends error
   */
  logError(
    userId: string | undefined,
    errorMessage: string,
    errorCode?: string,
    context?: Record<string, any>
  ): void {
    this.logEvent('friends.error', {
      user_id: userId,
      error_message: errorMessage,
      error_code: errorCode,
      ...context,
    });
  }

  /**
   * Enable/disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get telemetry status
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const telemetryService = new TelemetryService();
export default telemetryService;
