import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Legalia',
  slug: 'legalia',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/legalia-logo.png',
  userInterfaceStyle: 'light',
  scheme: 'legalia',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.legalia.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/legalia-logo.png',
      backgroundColor: '#FFFFFF',
    },
    package: 'com.legalia.app',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  experiments: {
    typedRoutes: false,
  },
  plugins: [],
  updates: {
    url: 'https://u.expo.dev/0acdc0ef-21e5-4f48-baf9-e044016ea955',
  },
  runtimeVersion: '1.0.0',
  extra: {
    eas: {
      projectId: '0acdc0ef-21e5-4f48-baf9-e044016ea955',
    },
    // Read from environment variables instead of hardcoding
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
