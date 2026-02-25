'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type LogUsageInput = {
  tool_id: string;
  month: string;
  usage_amount: number;
  currency: string;
  budget_limit: number | null;
};

export async function logUsage(input: LogUsageInput) {
  const supabase = await createClient();

  // Upsert — update if (tool_id, month) already exists
  const { error } = await supabase
    .from('usage_logs')
    .upsert(
      {
        tool_id: input.tool_id,
        month: input.month,
        usage_amount: input.usage_amount,
        currency: input.currency,
        budget_limit: input.budget_limit,
      },
      { onConflict: 'tool_id,month' }
    );

  if (error) return { error: error.message };

  revalidatePath('/usage');
  return { error: null };
}
