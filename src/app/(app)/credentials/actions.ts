'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CreateCredentialInput = {
  tool_id: string;
  login_type: string;
  credential_location: string;
  last_rotated: string;
  rotation_policy: string;
  owner: string;
  compliance_notes: string;
};

export async function createCredential(input: CreateCredentialInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('credential_reference').insert({
    tool_id: input.tool_id,
    login_type: input.login_type || null,
    credential_location: input.credential_location || null,
    last_rotated: input.last_rotated || null,
    rotation_policy: input.rotation_policy || null,
    owner: input.owner || null,
    compliance_notes: input.compliance_notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/credentials');
  return { error: null };
}
