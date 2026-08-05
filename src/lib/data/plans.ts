import { createClient } from '@/lib/supabase/server';
import { DEMO_PLANS } from './demo';
import { PLAN_LABELS, type SubscriptionPlan } from './types';

interface SubscriptionPlanRow {
  id: string;
  code: SubscriptionPlan['code'];
  price_first_period_xof: string | number;
  price_recurring_xof: string | number;
  billing_interval: SubscriptionPlan['billingInterval'];
  features: string[] | null;
}

export function mapSubscriptionPlan(row: SubscriptionPlanRow): SubscriptionPlan {
  return {
    id: row.id,
    code: row.code,
    label: PLAN_LABELS[row.code] ?? row.code,
    priceFirstPeriodXof: Number(row.price_first_period_xof),
    priceRecurringXof: Number(row.price_recurring_xof),
    billingInterval: row.billing_interval,
    features: row.features ?? [],
  };
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_PLANS;
  }

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, code, price_first_period_xof, price_recurring_xof, billing_interval, features')
    .eq('is_active', true)
    .order('price_recurring_xof', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as unknown as SubscriptionPlanRow[]).map(mapSubscriptionPlan);
}

export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null> {
  const supabase = await createClient();

  if (!supabase) {
    return DEMO_PLANS.find((plan) => plan.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, code, price_first_period_xof, price_recurring_xof, billing_interval, features')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSubscriptionPlan(data as unknown as SubscriptionPlanRow);
}
