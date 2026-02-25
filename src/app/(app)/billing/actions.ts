'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { PaymentFrequency } from '@/types/database';

export type CreateSubscriptionInput = {
  tool_id: string;
  plan_name: string;
  monthly_cost: number;
  currency: string;
  payment_frequency: PaymentFrequency;
  renewal_date: string;
  billing_owner: string;
};

export async function createSubscription(input: CreateSubscriptionInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('billing_subscriptions').insert({
    tool_id: input.tool_id,
    plan_name: input.plan_name || null,
    monthly_cost: input.monthly_cost,
    currency: input.currency || 'USD',
    payment_frequency: input.payment_frequency,
    renewal_date: input.renewal_date || null,
    billing_owner: input.billing_owner || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/billing');
  return { error: null };
}
