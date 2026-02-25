'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CredentialReference } from '@/types/database';
import AddCredentialModal from './AddCredentialModal';

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

  // Try to parse days from policy string e.g. "Every 90 days"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credentials</h1>
          <p className="mt-1 text-sm text-gray-400">{credentials.length} credential references — no raw passwords stored</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Reference
        </button>
      </div>

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-sm font-semibold text-red-300">
            {overdueCount} credential{overdueCount > 1 ? 's' : ''} overdue for rotation
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total References</p>
          <p className="mt-1.5 text-xl font-bold text-white">{credentials.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Overdue Rotation</p>
          <p className={`mt-1.5 text-xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-white'}`}>{overdueCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Never Rotated</p>
          <p className="mt-1.5 text-xl font-bold text-white">
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

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Tool', 'Login Type', 'Credential Location', 'Owner', 'Rotation Policy', 'Last Rotated'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">No credentials found</td>
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

      {showModal && (
        <AddCredentialModal tools={tools} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
