import { createClient } from '@/lib/supabase/server';
import IncidentsClient from './IncidentsClient';

export default async function IncidentsPage() {
  const supabase = await createClient();

  const [{ data: incidents }, { data: tools }] = (await Promise.all([
    supabase
      .from('incident_logs')
      .select('*, tools(id, name, category)')
      .order('occurred_at', { ascending: false }),
    supabase
      .from('tools')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
  ])) as Array<{ data: any[] | null; error: any }>;

  return <IncidentsClient incidents={incidents ?? []} tools={tools ?? []} />;
}
