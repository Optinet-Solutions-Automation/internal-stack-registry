'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { IncidentLog, IncidentType, IncidentSeverity, IncidentStatus } from '@/types/database';
import LogIncidentModal from './LogIncidentModal';
import { SearchInput, Pagination, useTableControls } from '@/components/TableControls';

type IncidentWithTool = IncidentLog & {
  tools: { id: string; name: string; category: string | null } | null;
};

type ToolOption = { id: string; name: string };

const SEVERITY_CLS: Record<IncidentSeverity, string> = {
  low:      'bg-green-900 text-green-300',
  medium:   'bg-yellow-900 text-yellow-300',
  high:     'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};

const STATUS_CLS: Record<IncidentStatus, string> = {
  open:          'bg-red-900 text-red-300',
  investigating: 'bg-yellow-900 text-yellow-300',
  resolved:      'bg-green-900 text-green-300',
};

const TYPE_CLS: Record<IncidentType, string> = {
  outage:     'bg-red-900 text-red-300',
  cost_spike: 'bg-orange-900 text-orange-300',
  security:   'bg-purple-900 text-purple-300',
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>{label.replace('_', ' ')}</span>;
}

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function IncidentsClient({ incidents, tools }: { incidents: IncidentWithTool[]; tools: ToolOption[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const preFiltered = incidents.filter(i => {
    if (filterType && i.type !== filterType) return false;
    if (filterSeverity && i.severity !== filterSeverity) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  const searchFn = useCallback((i: IncidentWithTool, q: string) =>
    !!(i.tools?.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)),
  []);

  const { search, setSearch, page, setPage, totalPages, totalFiltered, paginated } = useTableControls(preFiltered, searchFn);

  const openCount = incidents.filter(i => i.status === 'open').length;
  const investigatingCount = incidents.filter(i => i.status === 'investigating').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Incidents</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">{incidents.length} total incidents</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Log Incident
        </button>
      </div>

      {criticalCount > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-xs sm:text-sm font-semibold text-red-300">{criticalCount} critical incident{criticalCount > 1 ? 's' : ''} unresolved</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Open', value: openCount, cls: openCount > 0 ? 'text-red-400' : 'text-white' },
          { label: 'Investigating', value: investigatingCount, cls: investigatingCount > 0 ? 'text-yellow-400' : 'text-white' },
          { label: 'Critical', value: criticalCount, cls: criticalCount > 0 ? 'text-red-400' : 'text-white' },
          { label: 'Total', value: incidents.length, cls: 'text-white' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className={`mt-1 text-lg sm:text-xl font-bold ${card.cls}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search incidents..." />
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            <option value="outage">Outage</option>
            <option value="cost_spike">Cost Spike</option>
            <option value="security">Security</option>
          </select>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          {(filterType || filterSeverity || filterStatus) && (
            <button onClick={() => { setFilterType(''); setFilterSeverity(''); setFilterStatus(''); }}
              className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Clear</button>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center text-gray-500">No incidents found</div>
        ) : paginated.map(inc => (
          <Link key={inc.id} href={`/incidents/${inc.id}`} className="block bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              {inc.tools ? <span className="font-medium text-indigo-400 text-sm">{inc.tools.name}</span> : <span className="text-gray-500">—</span>}
              <Badge label={inc.severity} cls={SEVERITY_CLS[inc.severity]} />
            </div>
            {inc.description && <p className="text-xs text-gray-400 line-clamp-2">{inc.description}</p>}
            <CardField label="Type"><Badge label={inc.type} cls={TYPE_CLS[inc.type]} /></CardField>
            <CardField label="Status"><Badge label={inc.status} cls={STATUS_CLS[inc.status]} /></CardField>
            <CardField label="Date"><span className="text-xs text-gray-500">{new Date(inc.occurred_at).toLocaleDateString()}</span></CardField>
          </Link>
        ))}
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tool', 'Type', 'Description', 'Severity', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-500">No incidents found</td></tr>
              ) : paginated.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">{inc.tools ? <Link href={`/tools/${inc.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300">{inc.tools.name}</Link> : '—'}</td>
                  <td className="px-5 py-4"><Badge label={inc.type} cls={TYPE_CLS[inc.type]} /></td>
                  <td className="px-5 py-4 text-gray-400 max-w-xs truncate">{inc.description ?? '—'}</td>
                  <td className="px-5 py-4"><Badge label={inc.severity} cls={SEVERITY_CLS[inc.severity]} /></td>
                  <td className="px-5 py-4"><Badge label={inc.status} cls={STATUS_CLS[inc.status]} /></td>
                  <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(inc.occurred_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right"><Link href={`/incidents/${inc.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {showModal && <LogIncidentModal tools={tools} onClose={() => setShowModal(false)} />}
    </div>
  );
}
