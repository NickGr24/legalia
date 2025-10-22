import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Database } from '../utils/supabaseTypes'

// Type for our custom extra config
interface ExpoConfigExtra {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  eas?: {
    projectId?: string;
  };
}

// Get extra config with proper typing
const extra = (Constants.expoConfig?.extra || {}) as ExpoConfigExtra;

// Try to get from environment variables first, then fall back to app.config.ts extra
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  extra.supabaseUrl ||
  'https://qcdkkpgradcuochvplvy.supabase.co'

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra.supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZGtrcGdyYWRjdW9jaHZwbHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODU5MTksImV4cCI6MjA2OTU2MTkxOX0.PFuWlhUCuHXP7MygIrfwgTNNQ226oaVbMvHiHLNpXg4'

// Log configuration for debugging (only in dev)
if (__DEV__) {
  console.log('Supabase Config:', {
    url: supabaseUrl?.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
    source: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'env' :
            extra.supabaseUrl ? 'app.config.ts' : 'hardcoded fallback'
  })
}

// Custom storage adapter that uses SecureStore on native and AsyncStorage on web
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key)
      }
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.warn('Storage getItem error:', error)
      // Fallback to AsyncStorage on error
      try {
        return await AsyncStorage.getItem(key)
      } catch (fallbackError) {
        console.error('Fallback storage getItem failed:', fallbackError)
        return null
      }
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.setItem(key, value)
      }
      return await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.warn('Storage setItem error:', error)
      // Fallback to AsyncStorage on error
      try {
        return await AsyncStorage.setItem(key, value)
      } catch (fallbackError) {
        console.error('Fallback storage setItem failed:', fallbackError)
      }
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.removeItem(key)
      }
      return await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.warn('Storage removeItem error:', error)
      // Fallback to AsyncStorage on error
      try {
        return await AsyncStorage.removeItem(key)
      } catch (fallbackError) {
        console.error('Fallback storage removeItem failed:', fallbackError)
      }
    }
  },
}

// Create Supabase client with custom storage and no email confirmation
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Disable email confirmation completely
    flowType: 'implicit',
  },
})

export default supabase