import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import WalletDetailClient from './WalletDetailClient';

export default async function WalletDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: wallet }, { data: topups }, { data: usageLogs }] = (await Promise.all([
    supabase
      .from('wallets')
      .select('*, tools(id, name, category)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('topup_transactions')
      .select('*')
      .eq('wallet_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('usage_logs')
      .select('*')
      .order('month', { ascending: false })
      .limit(6),
  ])) as Array<{ data: any; error: any }>;

  if (!wallet) notFound();

  // Get usage logs for this tool
  const toolUsage = (usageLogs ?? []).filter((l: any) => l.tool_id === (wallet as any).tools?.id);

  const burnRate = toolUsage.length >= 2
    ? (Number(toolUsage[0].usage_amount) + Number(toolUsage[1].usage_amount)) / 2
    : toolUsage.length === 1
    ? Number(toolUsage[0].usage_amount)
    : null;

  const runway = burnRate && burnRate > 0
    ? Number(wallet.current_balance) / burnRate
    : null;

  return (
    <WalletDetailClient
      wallet={wallet as any}
      topups={topups ?? []}
      burnRate={burnRate}
      runway={runway}
    />
  );
}
