import { createClient } from '@supabase/supabase-js';
import { secureAuthStorage } from './secureStorage';
import { isSupabaseConfigured } from './supabaseConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export { isSupabaseConfigured };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
