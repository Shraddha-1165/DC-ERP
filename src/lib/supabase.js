import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const rememberPreferenceKey = 'dc-erp-remember-session'

const authStorage = {
  getItem(key) {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
  },
  setItem(key, value) {
    const persistent = window.localStorage.getItem(rememberPreferenceKey) === 'true'
    const target = persistent ? window.localStorage : window.sessionStorage
    const other = persistent ? window.sessionStorage : window.localStorage
    other.removeItem(key)
    target.setItem(key, value)
  },
  removeItem(key) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
