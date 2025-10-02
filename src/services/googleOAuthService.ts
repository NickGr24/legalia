import * as AuthSession from 'expo-auth-session';
// import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { supabaseService } from './supabaseService';

// Configuration constants from environment variables
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '420637377287-n0dahfq7gi5q6ttonn4bef08s5f85tpf.apps.googleusercontent.com';
const SUPABASE_REDIRECT_URL = process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL || 'https://qcdkkpgradcuochvplvy.supabase.co/auth/v1/callback';

export interface GoogleOAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

class GoogleOAuthService {
  private redirectUri: string;

  constructor() {
    // Set up redirect URI based on platform
    if (Platform.OS === 'web') {
      this.redirectUri = SUPABASE_REDIRECT_URL;
    } else {
      // Use localhost with correct port 8081 (matching Expo dev server)
      this.redirectUri = 'http://localhost:8081/auth/callback';
      
      // Debug log the redirect URI
    }
  }

  /**
   * Generate a secure random nonce for OAuth security
   */
  private async generateNonce(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      randomBytes.join('')
    );
  }

  /**
   * Handle the OAuth authentication result
   */
  private async handleAuthResult(result: any, nonce: string): Promise<GoogleOAuthResult> {
    if (result.type === 'success') {
      const { id_token } = result.params;
      
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      
      // Sign in to Supabase with the Google ID token
      const authResult = await supabaseService.signInWithGoogle(id_token, nonce);
      
      if (!authResult || !authResult.user) {
        throw new Error('Authentication failed');
      }

      return {
        success: true,
        user: authResult.user,
      };
    } else if (result.type === 'cancel') {
      return {
        success: false,
        error: 'Authentication was cancelled',
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Authentication failed',
      };
    }
  }

  /**
   * Initiate Google OAuth flow for native platforms using WebBrowser
   */
  async signInWithGoogleNative(): Promise<GoogleOAuthResult> {
    try {

      // Generate nonce for security
      const nonce = await this.generateNonce();

      // Build the OAuth URL manually
      const authUrl = this.buildGoogleOAuthUrl(nonce);

      
      // Use WebBrowser to open the OAuth URL
      // The redirectUri tells Google where to redirect, but WebBrowser will intercept it
      // TODO: Install expo-web-browser package for native OAuth
      return {
        success: false,
        error: 'Google Sign In is currently only available in development mode. Please use email/password authentication.',
      };

      
      // if (result.type === 'success' && result.url) {
      //   return await this.handleOAuthCallback(result.url, nonce);
      // } else if (result.type === 'cancel') {
      //   return {
      //     success: false,
      //     error: 'Authentication was cancelled',
      //   };
      // } else {
      //   return {
      //     success: false,
      //     error: 'Authentication failed',
      //   };
      // }

    } catch (error) {
      console.error('Google OAuth Native Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Build Google OAuth URL manually
   */
  private buildGoogleOAuthUrl(nonce: string): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: this.redirectUri,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce: nonce,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Handle OAuth callback URL
   */
  private async handleOAuthCallback(url: string, nonce: string): Promise<GoogleOAuthResult> {
    
    try {
      // The URL might have the ID token in either fragment (#) or query (?) parameters
      let idToken: string | null = null;
      
      // Try fragment first (standard for implicit flow)
      if (url.includes('#')) {
        const urlParts = url.split('#');
        if (urlParts.length >= 2) {
          const params = new URLSearchParams(urlParts[1]);
          idToken = params.get('id_token');
        }
      }
      
      // If not in fragment, try query parameters
      if (!idToken && url.includes('?')) {
        const urlParts = url.split('?');
        if (urlParts.length >= 2) {
          const params = new URLSearchParams(urlParts[1]);
          idToken = params.get('id_token');
        }
      }
      
      if (!idToken) {
        throw new Error('No ID token found in callback URL');
      }

      
      // Sign in to Supabase with the Google ID token
      const authResult = await supabaseService.signInWithGoogle(idToken, nonce);
      
      if (!authResult || !authResult.user) {
        throw new Error('Authentication failed');
      }

      return {
        success: true,
        user: authResult.user,
      };
    } catch (error) {
      console.error('❌ Failed to process OAuth callback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process authentication',
      };
    }
  }

  /**
   * Initiate Google OAuth flow for web platform
   */
  async signInWithGoogleWeb(): Promise<GoogleOAuthResult> {
    try {
      
      // For web, use Supabase's built-in OAuth which works well
      const result = await supabaseService.signInWithOAuth('google');
      
      if (result.error) {
        throw result.error;
      }

      // OAuth flow initiated successfully - web will handle redirect automatically
      return {
        success: true,
        // User data will come via auth state changes after redirect
      };
    } catch (error) {
      console.error('Google OAuth Web Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Main method to sign in with Google (platform-agnostic)
   */
  async signInWithGoogle(): Promise<GoogleOAuthResult> {

    if (Platform.OS === 'web') {
      return this.signInWithGoogleWeb();
    } else {
      return this.signInWithGoogleNative();
    }
  }

  /**
   * Get the configured redirect URI
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }

  /**
   * Validate Google OAuth configuration
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID')) {
      errors.push('Google Client ID is not configured properly');
    }

    if (!SUPABASE_REDIRECT_URL || SUPABASE_REDIRECT_URL.includes('YOUR_CALLBACK_URL')) {
      errors.push('Supabase redirect URL is not configured properly');
    }

    // Add helpful information about redirect URI setup
    
    if (Platform.OS === 'web') {
      // Web platform uses Supabase's built-in OAuth
    } else {
      // For native platforms, validate redirect URI configuration
      const expectedRedirectUris = [
        'https://auth.expo.io/@your-username/legalia',
        'https://auth.expo.io/@anonymous/legalia-*',
        SUPABASE_REDIRECT_URL
      ];
      
      if (!this.redirectUri) {
        errors.push('Redirect URI is not configured');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const googleOAuthService = new GoogleOAuthService();
export default googleOAuthService;