import { createClient } from '@/lib/supabase/server';
import BillingClient from './BillingClient';

export default async function BillingPage() {
  const supabase = await createClient();

  const [{ data: subscriptions }, { data: tools }] = await Promise.all([
    supabase
      .from('billing_subscriptions')
      .select('*, tools(id, name, category)')
      .order('renewal_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('tools')
      .select('id, name')
      .eq('billing_type', 'subscription')
      .eq('status', 'active')
      .order('name'),
  ]);

  return <BillingClient subscriptions={subscriptions ?? []} tools={tools ?? []} />;
}
