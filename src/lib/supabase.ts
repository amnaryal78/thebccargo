import { createClient } from '@supabase/supabase-js';
import { secureAuthStorage } from './secureStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
  import.meta.env.VITE_SUPABASE_URL.startsWith('https://')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
