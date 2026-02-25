import { createClient } from '@/lib/supabase/server';
import ToolsClient from './ToolsClient';

export default async function ToolsPage() {
  const supabase = await createClient();

  const { data: tools } = await supabase
    .from('tools')
    .select('*, billing_subscriptions(monthly_cost, currency)')
    .order('name');

  return <ToolsClient tools={tools ?? []} />;
}
