import { createClient } from '@/lib/supabase/server';
import CredentialsClient from './CredentialsClient';

export default async function CredentialsPage() {
  const supabase = await createClient();

  const [{ data: credentials }, { data: tools }] = (await Promise.all([
    supabase
      .from('credential_reference')
      .select('*, tools(id, name, category)')
      .order('last_rotated', { ascending: true, nullsFirst: true }),
    supabase
      .from('tools')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
  ])) as Array<{ data: any[] | null; error: any }>;

  return <CredentialsClient credentials={credentials ?? []} tools={tools ?? []} />;
}
