import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { supabaseService } from '../services/supabaseService'
import { googleOAuthService } from '../services/googleOAuthService'
import { Alert } from 'react-native'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  supabase: typeof supabase
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
  supabase,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          // Ensure user profile exists if user is authenticated
          if (session?.user) {
            try {
              const profile = await supabaseService.getUserProfile(session.user.id)
              if (!profile) {
                await supabaseService.createUserProfile()
              }
            } catch (error) {
              console.error('Error handling user profile:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          // Ensure user profile exists
          try {
            const profile = await supabaseService.getUserProfile(session.user.id)
            if (!profile) {
              await supabaseService.createUserProfile()
            }
          } catch (error) {
            console.error('Error handling user profile on sign in:', error)
          }
        } else if (event === 'SIGNED_OUT') {
        } else if (event === 'TOKEN_REFRESHED') {
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      await supabaseService.signUp(email, password)
      
      return { error: null }
      
    } catch (error) {
      console.error('❌ Signup error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      await supabaseService.signIn(email, password)
      
      return { error: null }
      
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      await supabaseService.signOut()
      
    } catch (error) {
      console.error('Sign out error:', error)
      Alert.alert('Error', 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      
      // Development workaround: Create a test user for Google OAuth
      if (__DEV__) {
        
        // Create a mock Google user for development
        const mockGoogleUser = {
          id: 'google-test-user',
          email: 'test.user@gmail.com',
          user_metadata: {
            full_name: 'Test Google User',
            provider: 'google',
            name: 'Test Google User',
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        // Simulate successful authentication
        setUser(mockGoogleUser as any)
        setSession({
          user: mockGoogleUser as any,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
        } as any)
        
        return { error: null }
      }
      
      // Production: Use real OAuth flow
      const configValidation = googleOAuthService.validateConfiguration()
      if (!configValidation.valid) {
        const errorMessage = `OAuth Configuration Error: ${configValidation.errors.join(', ')}`
        console.error(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      const result = await googleOAuthService.signInWithGoogle()

      if (!result.success) {
        console.error('Google sign in error:', result.error)
        return { error: { message: result.error || 'Google sign in failed' } as AuthError }
      }

      return { error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }


  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    supabase,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}