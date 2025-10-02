import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Database } from '../utils/supabaseTypes'

// Try to get from environment variables first, then fall back to app.json extra
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants.expoConfig?.extra?.supabaseUrl ||
  Constants.manifest?.extra?.supabaseUrl ||
  Constants.manifest2?.extra?.expoClient?.extra?.supabaseUrl ||
  'https://qcdkkpgradcuochvplvy.supabase.co'

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  Constants.manifest?.extra?.supabaseAnonKey ||
  Constants.manifest2?.extra?.expoClient?.extra?.supabaseAnonKey ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZGtrcGdyYWRjdW9jaHZwbHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODU5MTksImV4cCI6MjA2OTU2MTkxOX0.PFuWlhUCuHXP7MygIrfwgTNNQ226oaVbMvHiHLNpXg4'

// Log configuration for debugging (only in dev)
if (__DEV__) {
  console.log('Supabase Config:', {
    url: supabaseUrl?.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
    source: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'env' :
            Constants.expoConfig?.extra?.supabaseUrl ? 'expoConfig' :
            Constants.manifest?.extra?.supabaseUrl ? 'manifest' : 'hardcoded'
  })
}

// Custom storage adapter that uses SecureStore on native and AsyncStorage on web
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage on web since SecureStore is not available
      return AsyncStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage on web since SecureStore is not available
      return AsyncStorage.setItem(key, value)
    }
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use AsyncStorage on web since SecureStore is not available
      return AsyncStorage.removeItem(key)
    }
    return SecureStore.deleteItemAsync(key)
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