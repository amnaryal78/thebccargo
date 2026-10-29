/**
 * Supabase configuration flag. Kept separate from ./supabase so code that only needs to know whether
 * Supabase is configured does not pull the whole client library into its bundle.
 */
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project') &&
  import.meta.env.VITE_SUPABASE_URL.startsWith('https://')
);
