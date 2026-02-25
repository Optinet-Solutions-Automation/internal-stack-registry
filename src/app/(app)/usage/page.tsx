import { createClient } from '@/lib/supabase/server';
import UsageClient from './UsageClient';

export default async function UsagePage() {
  const supabase = await createClient();

  const [{ data: usageLogs }, { data: tools }] = await Promise.all([
    supabase
      .from('usage_logs')
      .select('*, tools(id, name, category, billing_type)')
      .order('month', { ascending: false }),
    supabase
      .from('tools')
      .select('id, name')
      .in('billing_type', ['usage', 'wallet'])
      .eq('status', 'active')
      .order('name'),
  ]);

  return <UsageClient usageLogs={usageLogs ?? []} tools={tools ?? []} />;
}
