# Google OAuth Setup Guide

## Prerequisites

1. Google Cloud Console project with OAuth 2.0 credentials
2. Supabase project with Google provider enabled

## Setup Steps

### 1. Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: `420637377287-n0dahfq7gi5q6ttonn4bef08s5f85tpf.apps.googleusercontent.com`
   - **Client Secret**: (Get this from Google Cloud Console)

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID or create a new one
5. Add authorized redirect URIs:
   
   **For Development:**
   - `http://localhost:19006/auth/callback` (Expo web)
   - `http://localhost:8081/auth/callback` (Expo web alternative)
   - `legalia://auth/callback` (Native app)
   - `https://qcdkkpgradcuochvplvy.supabase.co/auth/v1/callback` (Supabase)
   
   **For Production:**
   - `https://your-domain.com/auth/callback` (Web)
   - `legalia://auth/callback` (Native app)
   - `https://qcdkkpgradcuochvplvy.supabase.co/auth/v1/callback` (Supabase)

### 3. Environment Variables

Ensure your `.env` file contains:

```env
EXPO_PUBLIC_SUPABASE_URL=https://qcdkkpgradcuochvplvy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=420637377287-n0dahfq7gi5q6ttonn4bef08s5f85tpf.apps.googleusercontent.com
```

### 4. Testing

1. **Web Platform:**
   - Run `npm start` and press `w` for web
   - Click "Sign in with Google"
   - Should redirect to Google OAuth consent screen

2. **Native Platform:**
   - Run `npm start` and scan QR code with Expo Go
   - Click "Sign in with Google"
   - Should open in-app browser for authentication

## Troubleshooting

### "Invalid login credentials" Error
- Ensure Google provider is enabled in Supabase
- Verify Client ID and Secret are correctly configured
- Check that redirect URIs match exactly

### "Authentication failed" Error
- Verify all redirect URIs are added in Google Cloud Console
- Ensure the app scheme (`legalia://`) is correctly configured
- Check that Supabase URL and anon key are correct

### Testing with Expo Go
- Note: Custom URL schemes don't work in Expo Go
- Use development builds for full OAuth functionality:
  ```bash
  expo prebuild
  expo run:ios  # or expo run:android
  ```

## Security Notes

- Never commit the Google Client Secret to version control
- Use environment variables for sensitive configuration
- Rotate credentials regularly
- Monitor OAuth consent screen for unauthorized access