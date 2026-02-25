'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AlertItem } from './page';

const SEVERITY_CLS = {
  critical: 'bg-red-900 text-red-300 border-red-800',
  high:     'bg-orange-900 text-orange-300 border-orange-800',
  medium:   'bg-yellow-900 text-yellow-300 border-yellow-800',
  low:      'bg-gray-800 text-gray-400 border-gray-700',
};

const SEVERITY_DOT = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-gray-500',
};

const TYPE_LABEL: Record<AlertItem['type'], string> = {
  low_balance:      'Low Balance',
  budget_exceeded:  'Budget Exceeded',
  upcoming_renewal: 'Upcoming Renewal',
  overdue_renewal:  'Overdue Renewal',
  rotation_due:     'Rotation Due',
  low_runway:       'Low Runway',
  open_incident:    'Open Incident',
};

const TYPE_ICON: Record<AlertItem['type'], string> = {
  low_balance:      '◉',
  budget_exceeded:  '◈',
  upcoming_renewal: '◎',
  overdue_renewal:  '◎',
  rotation_due:     '◬',
  low_runway:       '◉',
  open_incident:    '◭',
};

export default function AlertsClient({ alerts }: { alerts: AlertItem[] }) {
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const filtered = alerts.filter(a => {
    if (filterType && a.type !== filterType) return false;
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="mt-1 text-sm text-gray-400">{alerts.length} active alerts — computed from live data</p>
      </div>

      {/* Critical banner */}
      {criticalCount > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-sm font-semibold text-red-300">
            {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} require immediate attention
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Critical', value: criticalCount,                                     cls: criticalCount > 0 ? 'text-red-400' : 'text-white' },
          { label: 'High',     value: highCount,                                          cls: highCount > 0 ? 'text-orange-400' : 'text-white' },
          { label: 'Medium',   value: alerts.filter(a => a.severity === 'medium').length, cls: 'text-white' },
          { label: 'Total',    value: alerts.length,                                      cls: 'text-white' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</p>
            <p className={`mt-1.5 text-xl font-bold ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(filterType || filterSeverity) && (
          <button onClick={() => { setFilterType(''); setFilterSeverity(''); }}
            className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Clear</button>
        )}
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-12 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-white font-semibold">All clear</p>
          <p className="text-sm text-gray-500 mt-1">No alerts match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div
              key={alert.id}
              className={`bg-gray-900 border rounded-xl px-5 py-4 flex items-start gap-4 ${SEVERITY_CLS[alert.severity].split(' ').filter(c => c.startsWith('border')).join(' ')}`}
            >
              {/* Severity dot */}
              <div className="mt-1 shrink-0">
                <span className={`block w-2 h-2 rounded-full ${SEVERITY_DOT[alert.severity]}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{TYPE_ICON[alert.type]}</span>
                  <span className="text-sm font-semibold text-white">{alert.title}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SEVERITY_CLS[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {TYPE_LABEL[alert.type]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{alert.message}</p>
              </div>

              {/* Action link */}
              <Link
                href={alert.link}
                className="shrink-0 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors whitespace-nowrap"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
