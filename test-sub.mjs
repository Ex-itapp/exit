import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://offvvtoftvijrlpdjmlb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZnZ2dG9mdHZpanJscGRqbWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwMzU1OTcsImV4cCI6MjEwMDYxMTU5N30.-JXyj-rL8gFsq8DP413MSIasuyArxft3UKL7Wphpnac';
const adminKey = process.env.ADMIN_API_KEY || 'nikkuprabhas'; // Wait, ADMIN_API_KEY is not the service role key.

// I don't have the SUPABASE_SERVICE_ROLE_KEY to write.
// But I can read using anon key if RLS allows, but RLS on profiles is `auth.uid() = id`.
