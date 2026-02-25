import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();

  const [{ data: userRoles }, { data: authUsers }] = await Promise.all([
    supabase.from('user_roles').select('*'),
    supabase.auth.admin?.listUsers().then(r => r?.data?.users ?? []).catch(() => []),
  ]);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SettingsClient
      userRoles={userRoles ?? []}
      currentUserId={user?.id ?? ''}
      currentUserEmail={user?.email ?? ''}
    />
  );
}
