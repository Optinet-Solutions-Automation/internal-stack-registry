'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Purchase } from '@/types/database';

export type CreatePurchaseInput = Omit<Purchase, 'id' | 'created_at' | 'updated_at'>;

export async function createPurchase(input: CreatePurchaseInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('purchases').insert({
    name: input.name,
    purchase_date: input.purchase_date,
    amount: input.amount,
    currency: input.currency,
    description: input.description || null,
    vendor: input.vendor || null,
    category: input.category || null,
    assigned_to: input.assigned_to || null,
    warranty_id: input.warranty_id || null,
    warranty_expires: input.warranty_expires || null,
    receipt_url: input.receipt_url || null,
    warranty_receipt_url: input.warranty_receipt_url || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/purchases');
  return { error: null };
}

export async function updatePurchase(id: string, input: CreatePurchaseInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('purchases').update({
    name: input.name,
    purchase_date: input.purchase_date,
    amount: input.amount,
    currency: input.currency,
    description: input.description || null,
    vendor: input.vendor || null,
    category: input.category || null,
    assigned_to: input.assigned_to || null,
    warranty_id: input.warranty_id || null,
    warranty_expires: input.warranty_expires || null,
    receipt_url: input.receipt_url || null,
    warranty_receipt_url: input.warranty_receipt_url || null,
  }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/purchases');
  return { error: null };
}

// Extract the storage path from a Supabase public URL
// e.g. ".../storage/v1/object/public/receipts/receipts/123.jpg" → "receipts/123.jpg"
function storagePathFromUrl(url: string): string | null {
  const marker = '/object/public/receipts/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deletePurchase(id: string) {
  const supabase = await createClient();

  // Fetch the URLs before deleting so we can clean up storage
  const { data: purchase } = await supabase
    .from('purchases')
    .select('receipt_url, warranty_receipt_url')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('purchases').delete().eq('id', id);
  if (error) return { error: error.message };

  // Delete storage files — ignore errors (file may not exist)
  const paths: string[] = [];
  if (purchase?.receipt_url) {
    const p = storagePathFromUrl(purchase.receipt_url);
    if (p) paths.push(p);
  }
  if (purchase?.warranty_receipt_url) {
    const p = storagePathFromUrl(purchase.warranty_receipt_url);
    if (p) paths.push(p);
  }
  if (paths.length > 0) {
    await supabase.storage.from('receipts').remove(paths);
  }

  revalidatePath('/purchases');
  return { error: null };
}
