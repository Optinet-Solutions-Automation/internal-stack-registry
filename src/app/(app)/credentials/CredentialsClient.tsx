'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CredentialReference } from '@/types/database';
import AddCredentialModal from './AddCredentialModal';

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function PasswordCell({ password }: { password: string | null }) {
  const [visible, setVisible] = useState(false);
  if (!password) return <span className="text-gray-500">—</span>;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-gray-300">{visible ? password : '••••••••'}</span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

type CredWithTool = CredentialReference & {
  tools: { id: string; name: string; category: string | null } | null;
};

type ToolOption = { id: string; name: string };

function daysSinceRotation(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function RotationStatus({ lastRotated, policy }: { lastRotated: string | null; policy: string | null }) {
  const days = daysSinceRotation(lastRotated);

  if (!lastRotated) {
    return <span className="text-gray-500">Never rotated</span>;
  }

  const label = new Date(lastRotated).toLocaleDateString();

  const match = policy?.match(/(\d+)/);
  const policyDays = match ? parseInt(match[1]) : null;

  if (policyDays && days !== null && days > policyDays) {
    return (
      <div>
        <span className="text-red-400 font-medium">{label}</span>
        <span className="ml-2 text-xs text-red-400">({days}d ago — overdue)</span>
      </div>
    );
  }

  if (policyDays && days !== null && days > policyDays * 0.8) {
    return (
      <div>
        <span className="text-yellow-400 font-medium">{label}</span>
        <span className="ml-2 text-xs text-yellow-400">({days}d ago)</span>
      </div>
    );
  }

  return <span className="text-gray-300">{label} <span className="text-gray-500 text-xs">({days}d ago)</span></span>;
}

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function CredentialsClient({
  credentials,
  tools,
}: {
  credentials: CredWithTool[];
  tools: ToolOption[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');

  const loginTypes = [...new Set(credentials.map(c => c.login_type).filter(Boolean))] as string[];

  const filtered = credentials.filter(c => !filterType || c.login_type === filterType);

  const overdueCount = credentials.filter(c => {
    const days = daysSinceRotation(c.last_rotated);
    const match = c.rotation_policy?.match(/(\d+)/);
    const policyDays = match ? parseInt(match[1]) : null;
    return days !== null && policyDays !== null && days > policyDays;
  }).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Credentials</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">{credentials.length} credential references</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Reference
        </button>
      </div>

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-xs sm:text-sm font-semibold text-red-300">
            {overdueCount} credential{overdueCount > 1 ? 's' : ''} overdue for rotation
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Total</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-white">{credentials.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Overdue</p>
          <p className={`mt-1 text-lg sm:text-xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-white'}`}>{overdueCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Never Rotated</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-white">
            {credentials.filter(c => !c.last_rotated).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Login Types</option>
          {loginTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {filterType && (
          <button onClick={() => setFilterType('')} className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Mobile: Card layout */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center text-gray-500">
            No credentials found
          </div>
        ) : (
          filtered.map(cred => (
            <div key={cred.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between mb-2">
                {cred.tools ? (
                  <Link href={`/tools/${cred.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300 text-sm">
                    {cred.tools.name}
                  </Link>
                ) : <span className="text-gray-500">—</span>}
                {cred.login_type && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                    {cred.login_type}
                  </span>
                )}
              </div>
              <CardField label="Username">
                <span className="font-mono text-xs text-gray-300">{cred.username ?? '—'}</span>
              </CardField>
              <CardField label="Password">
                <PasswordCell password={cred.password} />
              </CardField>
              <CardField label="Location">
                <span className="font-mono text-xs text-gray-300">{cred.credential_location ?? '—'}</span>
              </CardField>
              <CardField label="Owner">
                <span className="text-xs text-gray-400">{cred.owner ?? '—'}</span>
              </CardField>
              <CardField label="Policy">
                <span className="text-xs text-gray-400">{cred.rotation_policy ?? '—'}</span>
              </CardField>
              <CardField label="Last Rotated">
                <span className="text-xs"><RotationStatus lastRotated={cred.last_rotated} policy={cred.rotation_policy} /></span>
              </CardField>
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden lg:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tool', 'Login Type', 'Username', 'Password', 'Credential Location', 'Owner', 'Rotation Policy', 'Last Rotated'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-500">No credentials found</td>
                </tr>
              ) : (
                filtered.map(cred => (
                  <tr key={cred.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      {cred.tools ? (
                        <Link href={`/tools/${cred.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300">
                          {cred.tools.name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {cred.login_type ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                          {cred.login_type}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{cred.username ?? '—'}</td>
                    <td className="px-5 py-4">
                      <PasswordCell password={cred.password} />
                    </td>
                    <td className="px-5 py-4 text-gray-300 font-mono text-xs">{cred.credential_location ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-400">{cred.owner ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{cred.rotation_policy ?? '—'}</td>
                    <td className="px-5 py-4">
                      <RotationStatus lastRotated={cred.last_rotated} policy={cred.rotation_policy} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddCredentialModal tools={tools} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
