'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ToolRequestStatus } from '@/types/database';

export type CreateToolRequestInput = {
  tool_name: string;
  category: string;
  vendor: string;
  justification: string;
  requested_by: string;
};

export async function createToolRequest(input: CreateToolRequestInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('tool_requests').insert({
    tool_name: input.tool_name,
    category: input.category || null,
    vendor: input.vendor || null,
    justification: input.justification || null,
    requested_by: input.requested_by,
  });

  if (error) return { error: error.message };

  revalidatePath('/tool-requests');
  return { error: null };
}

export async function reviewToolRequest(
  id: string,
  status: 'approved' | 'rejected',
  reviewed_by: string,
  review_notes: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tool_requests')
    .update({ status, reviewed_by: reviewed_by || null, review_notes: review_notes || null })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/tool-requests');
  return { error: null };
}

export async function deleteToolRequest(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('tool_requests').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/tool-requests');
  return { error: null };
}
