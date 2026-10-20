import { createBrowserClient } from '@supabase/ssr';

// Never hard-code a real project here: a missing env var must not silently
// point the app at someone else's database. Placeholder values keep the module
// importable during static builds; runtime calls will fail loudly if unset.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.');
}

/**
 * Browser client backed by cookies (not localStorage). This is what lets the
 * server-side `createServerSupabase()` client see the session and keeps RLS
 * scoped to the signed-in user for API routes.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
