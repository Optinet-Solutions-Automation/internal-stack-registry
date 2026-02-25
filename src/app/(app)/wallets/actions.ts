'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTopUp(walletId: string, input: {
  amount: number;
  currency: string;
  topped_up_by: string;
  notes: string;
}) {
  const supabase = await createClient();

  const { error: txError } = await supabase.from('topup_transactions').insert({
    wallet_id: walletId,
    amount: input.amount,
    currency: input.currency,
    topped_up_by: input.topped_up_by || null,
    notes: input.notes || null,
  });

  if (txError) return { error: txError.message };

  // Update wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('current_balance')
    .eq('id', walletId)
    .single();

  if (wallet) {
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ current_balance: Number(wallet.current_balance) + input.amount })
      .eq('id', walletId);

    if (updateError) return { error: updateError.message };
  }

  revalidatePath('/wallets');
  return { error: null };
}

export async function updateThreshold(walletId: string, threshold: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wallets')
    .update({ low_threshold: threshold })
    .eq('id', walletId);

  if (error) return { error: error.message };

  revalidatePath('/wallets');
  return { error: null };
}
