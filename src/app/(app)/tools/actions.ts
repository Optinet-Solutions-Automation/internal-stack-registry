'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { BillingType, RiskLevel, ToolStatus } from '@/types/database';

export type CreateToolInput = {
  name: string;
  category: string;
  billing_type: BillingType;
  vendor: string;
  owner: string;
  environment: string;
  critical: boolean;
  risk_level: RiskLevel;
  status: ToolStatus;
  description: string;
};

export async function createTool(input: CreateToolInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('tools').insert({
    name: input.name,
    category: input.category || null,
    billing_type: input.billing_type,
    vendor: input.vendor || null,
    owner: input.owner || null,
    environment: input.environment || null,
    critical: input.critical,
    risk_level: input.risk_level,
    status: input.status,
    description: input.description || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/tools');
  return { error: null };
}
