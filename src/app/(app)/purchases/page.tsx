import { createClient } from '@/lib/supabase/server';
import PurchasesClient from './PurchasesClient';

export default async function PurchasesPage() {
  const supabase = await createClient();

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .order('purchase_date', { ascending: false });

  return <PurchasesClient purchases={purchases ?? []} />;
}
