import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
}

// Create Supabase client with configuration optimized for your app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (good for dashboard apps)
    storage: window.localStorage,
    // Auto-refresh tokens
    autoRefreshToken: true,
    // Persist user session across browser tabs
    persistSession: true,
    // Detect session in URL (useful for email confirmation links)
    detectSessionInUrl: true,
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'crossfit-dashboard@1.0.0',
    },
  },
  // Realtime configuration for live features
  realtime: {
    // Configure params for your specific use case
    params: {
      eventsPerSecond: 10, // Limit events for performance
    },
  },
})

// Helper function to check if we're in development
export const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'

// Helper function to get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function to sign out
export const signOut = () => {
  return supabase.auth.signOut()
}

// Helper to get session
export const getSession = () => {
  return supabase.auth.getSession()
}

// Export types for TypeScript support  
export type { User, Session } from '@supabase/supabase-js'
export type { Database, Tables, Enums } from './database.types'