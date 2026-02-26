import { createClient } from '@/lib/supabase/server';
import WalletsClient from './WalletsClient';

export default async function WalletsPage() {
  const supabase = await createClient();

  const { data: wallets } = await supabase
    .from('wallets')
    .select('*, tools(id, name, category)')
    .order('current_balance', { ascending: true }) as { data: any[] | null; error: any };

  return <WalletsClient wallets={wallets ?? []} />;
}
