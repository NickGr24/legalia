import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from '@/utils/supabaseTypes'

// Environment variables - Replace these with your actual Supabase project credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable')
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