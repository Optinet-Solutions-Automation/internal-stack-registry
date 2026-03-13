import { createClient } from '@/lib/supabase/server';
import ToolRequestsClient from './ToolRequestsClient';
import type { ToolRequest } from '@/types/database';

export default async function ToolRequestsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('tool_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return <ToolRequestsClient requests={(data as ToolRequest[]) ?? []} />;
}
