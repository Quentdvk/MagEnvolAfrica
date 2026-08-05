import { createClient } from '@/lib/supabase/server';

export interface ActiveSubscription {
  id: string;
  planId: string | null;
  currentPeriodEnd: string;
}

export async function getActiveSubscriptionForCurrentUser(): Promise<ActiveSubscription | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, plan_id, current_period_end')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .gte('current_period_end', new Date().toISOString())
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as { id: string; plan_id: string | null; current_period_end: string };

  return { id: row.id, planId: row.plan_id, currentPeriodEnd: row.current_period_end };
}
