/**
 * Google Authentication Service
 * Handles Google OAuth for both web and native platforms
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import { logger } from '../utils/logger';

// Complete OAuth flow on web
WebBrowser.maybeCompleteAuthSession();

// Get Supabase URL from the client config
const SUPABASE_URL = 'https://qcdkkpgradcuochvplvy.supabase.co';

export interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

class GoogleAuthService {
  private redirectUri: string;

  constructor() {
    // Configure redirect URI based on platform
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'legalia', // This matches your app.config.ts scheme
      path: 'auth/callback',
      preferLocalhost: true, // For development
      isTripleSlashed: true,
    });
    
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
      // For web, use Supabase's built-in OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
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
   * Native platform Google sign-in using AuthSession
   */
  private async signInWithGoogleNative(): Promise<GoogleAuthResult> {
    try {
      // Create auth request
      const authRequest = new AuthSession.AuthRequest({
        clientId: '420637377287-n0dahfq7gi5q6ttonn4bef08s5f85tpf.apps.googleusercontent.com',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: this.redirectUri,
        responseType: AuthSession.ResponseType.Token,
        prompt: AuthSession.Prompt.SelectAccount,
      });

      // Load the request
      await authRequest.makeAuthUrlAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      // Prompt the user
      const result = await authRequest.promptAsync();

      if (result.type === 'success') {
        // We have the access token from Google
        // Now exchange it with Supabase
        return this.handleGoogleTokens(result.params);
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
        error: error instanceof Error ? error.message : 'Native authentication failed',
      };
    }
  }

  /**
   * Alternative native approach using Supabase OAuth URL
   */
  async signInWithGoogleNativeAlternative(): Promise<GoogleAuthResult> {
    try {
      // Get OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.redirectUri,
          skipBrowserRedirect: true, // We'll handle the redirect manually
        },
      });

      if (error || !data?.url) {
        throw new Error('Failed to get OAuth URL');
      }

      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        this.redirectUri
      );

      if (result.type === 'success') {
        // Extract the access token from the URL
        const urlParams = this.parseUrlParams(result.url);
        
        if (urlParams.access_token) {
          // Set the session in Supabase
          const { data: session, error: sessionError } = await supabase.auth.setSession({
            access_token: urlParams.access_token,
            refresh_token: urlParams.refresh_token || '',
          });

          if (sessionError) throw sessionError;

          return {
            success: true,
            user: session?.user,
          };
        } else if (urlParams.code) {
          // Exchange authorization code for session
          const { data: session, error: exchangeError } = await supabase.auth.exchangeCodeForSession(urlParams.code);
          
          if (exchangeError) throw exchangeError;

          return {
            success: true,
            user: session?.user,
          };
        }
        
        throw new Error('No access token or code in response');
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
      logger.error('Alternative native Google sign-in error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Handle Google OAuth tokens
   */
  private async handleGoogleTokens(params: any): Promise<GoogleAuthResult> {
    try {
      if (!params.access_token) {
        throw new Error('No access token received');
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${params.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }

      const userInfo = await userInfoResponse.json();

      // Sign in to Supabase with the user info
      // Note: This requires Supabase to be configured to accept Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: userInfo,
      };
    } catch (error) {
      logger.error('Token handling error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process authentication',
      };
    }
  }

  /**
   * Parse URL parameters
   */
  private parseUrlParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // Try hash params first (for implicit flow)
    const hashParams = url.split('#')[1];
    if (hashParams) {
      const searchParams = new URLSearchParams(hashParams);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    // Also check query params (for authorization code flow)
    const queryParams = url.split('?')[1];
    if (queryParams) {
      const searchParams = new URLSearchParams(queryParams.split('#')[0]);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    
    return params;
  }

  /**
   * Get the configured redirect URI
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }

  /**
   * Check if Google Auth is properly configured
   */
  isConfigured(): boolean {
    // Check if we have necessary configuration
    return Boolean(this.redirectUri && SUPABASE_URL);
  }
}

export const googleAuthService = new GoogleAuthService();
export default googleAuthService;