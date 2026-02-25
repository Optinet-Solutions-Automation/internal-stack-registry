'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resolveIncident } from '../actions';
import type { IncidentLog, IncidentType, IncidentSeverity, IncidentStatus } from '@/types/database';

type IncidentWithTool = IncidentLog & {
  tools: { id: string; name: string; category: string | null } | null;
};

const SEVERITY_CLS: Record<IncidentSeverity, string> = {
  low: 'bg-green-900 text-green-300', medium: 'bg-yellow-900 text-yellow-300',
  high: 'bg-orange-900 text-orange-300', critical: 'bg-red-900 text-red-300',
};
const STATUS_CLS: Record<IncidentStatus, string> = {
  open: 'bg-red-900 text-red-300', investigating: 'bg-yellow-900 text-yellow-300',
  resolved: 'bg-green-900 text-green-300',
};
const TYPE_CLS: Record<IncidentType, string> = {
  outage: 'bg-red-900 text-red-300', cost_spike: 'bg-orange-900 text-orange-300',
  security: 'bg-purple-900 text-purple-300',
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>{label.replace('_', ' ')}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function IncidentDetailClient({ incident }: { incident: IncidentWithTool }) {
  const [resolvedBy, setResolvedBy] = useState('');
  const [resolving, setResolving] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolving(true);
    setResolveError(null);
    const result = await resolveIncident(incident.id, resolvedBy);
    setResolving(false);
    if (result.error) {
      setResolveError(result.error);
    } else {
      setShowResolve(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div>
        <Link href="/incidents" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Incidents
        </Link>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white capitalize">
            {incident.type.replace('_', ' ')}
          </h1>
          <Badge label={incident.severity} cls={SEVERITY_CLS[incident.severity]} />
          <Badge label={incident.status} cls={STATUS_CLS[incident.status]} />
          <Badge label={incident.type} cls={TYPE_CLS[incident.type]} />
        </div>
        {incident.tools && (
          <p className="mt-2 text-sm text-gray-400">
            Tool: <Link href={`/tools/${incident.tools.id}`} className="text-indigo-400 hover:text-indigo-300">{incident.tools.name}</Link>
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Occurred',        value: new Date(incident.occurred_at).toLocaleDateString() },
          { label: 'Financial Impact', value: incident.financial_impact != null ? `USD ${Number(incident.financial_impact).toFixed(2)}` : '—' },
          { label: 'Resolved By',      value: incident.resolved_by ?? '—' },
          { label: 'Resolved At',      value: incident.resolved_at ? new Date(incident.resolved_at).toLocaleDateString() : '—' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</p>
            <p className="mt-1.5 text-sm font-semibold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <Section title="Description">
        <p className="text-sm text-gray-300">{incident.description ?? 'No description provided.'}</p>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Root Cause">
          <p className="text-sm text-gray-300">{incident.root_cause ?? '—'}</p>
        </Section>
        <Section title="Resolution Steps">
          <p className="text-sm text-gray-300">{incident.resolution_steps ?? '—'}</p>
        </Section>
      </div>

      <Section title="Preventive Measures">
        <p className="text-sm text-gray-300">{incident.preventive_measures ?? '—'}</p>
      </Section>

      {/* Resolve action */}
      {incident.status !== 'resolved' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resolve Incident</h2>
          {!showResolve ? (
            <button
              onClick={() => setShowResolve(true)}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Mark as Resolved
            </button>
          ) : (
            <form onSubmit={handleResolve} className="space-y-3 max-w-sm">
              {resolveError && (
                <div className="bg-red-900/40 border border-red-800 text-red-300 text-xs rounded-lg px-3 py-2">{resolveError}</div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Resolved By</label>
                <input
                  type="text"
                  value={resolvedBy}
                  onChange={e => setResolvedBy(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowResolve(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={resolving} className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {resolving ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
