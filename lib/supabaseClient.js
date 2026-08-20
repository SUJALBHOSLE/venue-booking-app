import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

/**
 * Supabase client configured for Session-Only storage:
 * - Uses window.sessionStorage (not persistent long-lived cookies)
 * - Auto-clears upon tab/browser closure or idle timeout
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'vdt_auth_session_token'
  }
});