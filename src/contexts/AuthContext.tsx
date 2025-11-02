import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { supabaseService } from '../services/supabaseService'
import { googleAuthService } from '../services/googleAuthService'
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
  const [loading, setLoading] = useState(false) // Changed to false - don't wait for auth!

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return;

        if (error) {
          console.error('❌ Error getting initial session:', error)
        } else {
          console.log('✅ Session retrieved:', session ? 'authenticated' : 'not authenticated')
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('❌ Critical error during auth initialization:', error)
      }
    }

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await supabaseService.getUserProfile(session.user.id)
            if (!profile) {
              await supabaseService.createUserProfile()
            }
          } catch (error) {
            console.error('Error handling user profile on sign in:', error)
          }
        }
      }
    )

    return () => {
      isMounted = false;
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

      // Check if Google Auth is configured
      if (!googleAuthService.isConfigured()) {
        const errorMessage = 'Google authentication is not properly configured'
        console.error(errorMessage)
        return { error: { message: errorMessage } as AuthError }
      }

      // Use the new Google auth service
      const result = await googleAuthService.signInWithGoogle()

      if (!result.success) {
        console.error('Google sign in error:', result.error)
        return { error: { message: result.error || 'Google sign in failed' } as AuthError }
      }

      // If we have a user, ensure profile exists
      if (result.user) {
        try {
          const profile = await supabaseService.getUserProfile(result.user.id)
          if (!profile) {
            await supabaseService.createUserProfile()
          }
        } catch (error) {
          console.error('Error handling user profile after Google sign in:', error)
        }
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