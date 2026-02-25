'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/database';

export type LogIncidentInput = {
  tool_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  root_cause: string;
  financial_impact: number | null;
  resolution_steps: string;
  preventive_measures: string;
  status: IncidentStatus;
  occurred_at: string;
};

export async function logIncident(input: LogIncidentInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('incident_logs').insert({
    tool_id: input.tool_id,
    type: input.type,
    severity: input.severity,
    description: input.description || null,
    root_cause: input.root_cause || null,
    financial_impact: input.financial_impact,
    resolution_steps: input.resolution_steps || null,
    preventive_measures: input.preventive_measures || null,
    status: input.status,
    occurred_at: input.occurred_at || new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath('/incidents');
  return { error: null };
}

export async function resolveIncident(id: string, resolvedBy: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('incident_logs')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/incidents');
  revalidatePath(`/incidents/${id}`);
  return { error: null };
}
