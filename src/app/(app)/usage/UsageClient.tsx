'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { UsageLog } from '@/types/database';
import LogUsageModal from './LogUsageModal';
import { SearchInput, Pagination, useTableControls } from '@/components/TableControls';

type UsageWithTool = UsageLog & {
  tools: { id: string; name: string; category: string | null; billing_type: string } | null;
};

type ToolOption = { id: string; name: string };

function BudgetBar({ usage, limit }: { usage: number; limit: number | null }) {
  if (!limit) return <span className="text-gray-500 text-xs">No limit set</span>;
  const pct = Math.min((usage / limit) * 100, 100);
  const over = usage > limit;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden min-w-16">
        <div className={`h-full rounded-full ${over ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium w-10 text-right ${over ? 'text-red-400' : pct >= 80 ? 'text-yellow-400' : 'text-gray-400'}`}>{pct.toFixed(0)}%</span>
    </div>
  );
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function UsageClient({ usageLogs, tools }: { usageLogs: UsageWithTool[]; tools: ToolOption[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filterTool, setFilterTool] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const months = [...new Set(usageLogs.map(l => l.month.slice(0, 7)))].sort().reverse();
  const toolNames = [...new Set(usageLogs.map(l => l.tools?.name).filter(Boolean))] as string[];

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const currentLogs = usageLogs.filter(l => l.month.startsWith(currentMonthStr));
  const totalThisMonth = currentLogs.reduce((sum, l) => sum + Number(l.usage_amount), 0);
  const overBudget = currentLogs.filter(l => l.budget_limit && Number(l.usage_amount) > Number(l.budget_limit)).length;

  const preFiltered = usageLogs.filter(l => {
    if (filterTool && l.tools?.name !== filterTool) return false;
    if (filterMonth && !l.month.startsWith(filterMonth)) return false;
    return true;
  });

  const searchFn = useCallback((l: UsageWithTool, q: string) =>
    !!(l.tools?.name?.toLowerCase().includes(q)),
  []);

  const { search, setSearch, page, setPage, totalPages, totalFiltered, paginated } = useTableControls(preFiltered, searchFn);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Usage</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">Monthly usage tracking and budget monitoring</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Log Usage
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">This Month</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-white">{totalThisMonth > 0 ? `USD ${totalThisMonth.toFixed(2)}` : '—'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Over Budget</p>
          <p className={`mt-1 text-lg sm:text-xl font-bold ${overBudget > 0 ? 'text-red-400' : 'text-white'}`}>{overBudget}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Total Entries</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-white">{usageLogs.length}</p>
        </div>
      </div>

      {overBudget > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-xs sm:text-sm font-semibold text-red-300">{overBudget} tool{overBudget > 1 ? 's' : ''} exceeded budget this month</p>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search usage..." />
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <select value={filterTool} onChange={e => setFilterTool(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Tools</option>
            {toolNames.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{formatMonth(`${m}-01`)}</option>)}
          </select>
          {(filterTool || filterMonth) && (
            <button onClick={() => { setFilterTool(''); setFilterMonth(''); }} className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Clear</button>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center text-gray-500">No usage data found</div>
        ) : paginated.map(log => {
          const over = log.budget_limit && Number(log.usage_amount) > Number(log.budget_limit);
          return (
            <div key={log.id} className={`bg-gray-900 border rounded-xl p-4 space-y-1 ${over ? 'border-red-800/50' : 'border-gray-800'}`}>
              <div className="flex items-center justify-between mb-2">
                {log.tools ? (
                  <Link href={`/tools/${log.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300 text-sm">{log.tools.name}</Link>
                ) : <span className="text-gray-500">—</span>}
                <span className="text-xs text-gray-500">{formatMonth(log.month)}</span>
              </div>
              <CardField label="Usage"><span className={`text-xs font-semibold ${over ? 'text-red-400' : 'text-white'}`}>{log.currency} {Number(log.usage_amount).toFixed(4)}</span></CardField>
              <CardField label="Budget"><span className="text-xs text-gray-400">{log.budget_limit ? `${log.currency} ${Number(log.budget_limit).toFixed(2)}` : '—'}</span></CardField>
              <div className="pt-1"><BudgetBar usage={Number(log.usage_amount)} limit={log.budget_limit ? Number(log.budget_limit) : null} /></div>
            </div>
          );
        })}
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Tool', 'Month', 'Usage Amount', 'Budget Limit', 'Budget Used', 'Currency'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500">No usage data found</td></tr>
              ) : paginated.map(log => {
                const over = log.budget_limit && Number(log.usage_amount) > Number(log.budget_limit);
                return (
                  <tr key={log.id} className={`hover:bg-gray-800/50 transition-colors ${over ? 'bg-red-950/20' : ''}`}>
                    <td className="px-5 py-4">{log.tools ? <Link href={`/tools/${log.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300">{log.tools.name}</Link> : '—'}</td>
                    <td className="px-5 py-4 text-gray-300">{formatMonth(log.month)}</td>
                    <td className="px-5 py-4"><span className={`font-semibold ${over ? 'text-red-400' : 'text-white'}`}>{Number(log.usage_amount).toFixed(4)}</span></td>
                    <td className="px-5 py-4 text-gray-400">{log.budget_limit ? Number(log.budget_limit).toFixed(2) : '—'}</td>
                    <td className="px-5 py-4 w-40"><BudgetBar usage={Number(log.usage_amount)} limit={log.budget_limit ? Number(log.budget_limit) : null} /></td>
                    <td className="px-5 py-4 text-gray-400">{log.currency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {showModal && <LogUsageModal tools={tools} onClose={() => setShowModal(false)} />}
    </div>
  );
}
