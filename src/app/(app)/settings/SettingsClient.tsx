'use client';

import type { UserRoleRow, UserRole } from '@/types/database';

const ROLE_CLS: Record<UserRole, string> = {
  super_admin:   'bg-indigo-900 text-indigo-300',
  finance_admin: 'bg-blue-900 text-blue-300',
  devops:        'bg-green-900 text-green-300',
  viewer:        'bg-gray-800 text-gray-400',
};

const ROLE_DESC: Record<UserRole, string> = {
  super_admin:   'Full access to all modules and settings',
  finance_admin: 'Access to billing and wallets',
  devops:        'Access to tools, usage, credentials, and incidents',
  viewer:        'Read-only access to all modules',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsClient({
  userRoles,
  currentUserId,
  currentUserEmail,
}: {
  userRoles: UserRoleRow[];
  currentUserId: string;
  currentUserEmail: string;
}) {
  const currentRole = userRoles.find(r => r.user_id === currentUserId);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Account, roles, and system information</p>
      </div>

      {/* Current user */}
      <Section title="Your Account">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-white">{currentUserEmail}</p>
            <p className="text-xs text-gray-500 mt-0.5">Signed in via Google SSO</p>
          </div>
          {currentRole && (
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_CLS[currentRole.role]}`}>
              {currentRole.role.replace('_', ' ')}
            </span>
          )}
        </div>
      </Section>

      {/* Roles reference */}
      <Section title="Role Permissions">
        <div className="space-y-3">
          {(Object.entries(ROLE_DESC) as [UserRole, string][]).map(([role, desc]) => (
            <div key={role} className="flex items-start justify-between gap-4 py-2 border-b border-gray-800 last:border-0">
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_CLS[role]}`}>
                  {role.replace('_', ' ')}
                </span>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-800 rounded-lg px-4 py-3 mt-2">
          <p className="text-xs text-gray-400">
            To assign or change a user role, run this in the Supabase SQL editor:
          </p>
          <pre className="text-xs text-indigo-300 mt-2 font-mono overflow-x-auto">
{`INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role;`}
          </pre>
        </div>
      </Section>

      {/* Assigned roles */}
      <Section title="Assigned Roles">
        {userRoles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {userRoles.map(r => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-xs text-gray-500 font-mono">{r.user_id}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Added {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_CLS[r.role]}`}>
                  {r.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* System info */}
      <Section title="System">
        <div className="space-y-2 text-sm">
          {[
            { label: 'Database',   value: 'Supabase PostgreSQL' },
            { label: 'Auth',       value: 'Google SSO via Supabase Auth' },
            { label: 'Frontend',   value: 'Next.js 14 (App Router)' },
            { label: 'Deployment', value: 'Vercel' },
            { label: 'RLS',        value: 'Enabled on all tables' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
