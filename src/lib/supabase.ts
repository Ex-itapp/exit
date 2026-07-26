import { createClient } from '@supabase/supabase-js';

// Safe fallbacks to prevent Vercel static prerendering build failures if environment variables are not yet added to the dashboard
const FALLBACK_URL = 'https://offvvtoftvijrlpdjmlb.supabase.co';
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZnZ2dG9mdHZpanJscGRqbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzU1OTcsImV4cCI6MjEwMDYxMTU5N30.-JXyj-rL8gFsq8DP413MSIasuyArxft3UKL7Wphpnac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_ANON;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
