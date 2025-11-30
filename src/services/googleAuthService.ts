/**
 * Google Authentication Service
 * Handles Google OAuth for both web and native platforms
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';

// Complete OAuth flow on web
WebBrowser.maybeCompleteAuthSession();

export interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

class GoogleAuthService {
  private redirectUri: string;

  constructor() {
    // Configure redirect URI based on platform
    if (Platform.OS === 'web') {
      // Web: use the current origin with /auth/callback path
      this.redirectUri = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'http://localhost:3000/auth/callback';
    } else {
      // Native: use deep link scheme (legalia://auth/callback)
      this.redirectUri = AuthSession.makeRedirectUri({
        scheme: 'legalia',
        path: 'auth/callback',
        preferLocalhost: false,
      });
    }

    logger.info('Google Auth redirect URI:', { redirectUri: this.redirectUri });
  }

  /**
   * Sign in with Google - main entry point
   */
  async signInWithGoogle(): Promise<GoogleAuthResult> {
    try {
      if (Platform.OS === 'web') {
        return this.signInWithGoogleWeb();
      } else {
        return this.signInWithGoogleNative();
      }
    } catch (error) {
      logger.error('Google sign-in failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Web platform Google sign-in
   */
  private async signInWithGoogleWeb(): Promise<GoogleAuthResult> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        // User data will be available after redirect
      };
    } catch (error) {
      logger.error('Web Google sign-in error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web authentication failed',
      };
    }
  }

  /**
   * Native platform Google sign-in using Supabase OAuth
   */
  private async signInWithGoogleNative(): Promise<GoogleAuthResult> {
    try {
      logger.info('Starting native Google sign-in', {
        redirectUri: this.redirectUri,
        platform: Platform.OS
      });

      // Get OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        logger.error('Failed to get OAuth URL', { error });
        throw new Error('Failed to get OAuth URL from Supabase');
      }

      logger.info('Opening OAuth URL', {
        oauthUrl: data.url,
        expectedRedirectUri: this.redirectUri
      });

      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        this.redirectUri
      );

      if (result.type === 'success' && result.url) {
        logger.info('OAuth success, exchanging code for session', { url: result.url });

        // Exchange the authorization code for a session
        const { data: sessionData, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(result.url);

        if (exchangeError) {
          logger.error('Code exchange failed', { error: exchangeError });
          throw exchangeError;
        }

        logger.info('Session established', { user: sessionData?.user?.email });

        return {
          success: true,
          user: sessionData?.user,
        };
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication cancelled',
        };
      } else {
        return {
          success: false,
          error: 'Authentication failed',
        };
      }
    } catch (error) {
      logger.error('Native Google sign-in error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Sign out error', { error });
      throw error;
    }
  }
}

export const googleAuthService = new GoogleAuthService();
