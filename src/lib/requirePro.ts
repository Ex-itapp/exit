import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from './supabase-server';

type ProCheckSuccess = { user: { id: string; email?: string }; error: null };
type ProCheckFailure = { user: null; error: NextResponse };
type ProCheckResult = ProCheckSuccess | ProCheckFailure;

export async function requirePro(): Promise<ProCheckResult> {
  const supabase = await createServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // TEST MODE: Bypassing subscription check for free testing
  return { user: { id: user.id, email: user.email }, error: null };
}
