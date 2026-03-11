'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Tool, BillingType, RiskLevel, ToolStatus } from '@/types/database';
import AddToolModal from './AddToolModal';
import { SearchInput, Pagination, useTableControls } from '@/components/TableControls';

type ToolWithBilling = Tool & {
  billing_subscriptions: { monthly_cost: number; currency: string }[] | null;
};

const RISK_BADGE: Record<RiskLevel, string> = {
  low:      'bg-green-900 text-green-300',
  medium:   'bg-yellow-900 text-yellow-300',
  high:     'bg-orange-900 text-orange-300',
  critical: 'bg-red-900 text-red-300',
};

const STATUS_BADGE: Record<ToolStatus, string> = {
  active:     'bg-green-900 text-green-300',
  inactive:   'bg-gray-800 text-gray-400',
  deprecated: 'bg-red-900 text-red-300',
};

const BILLING_BADGE: Record<BillingType, string> = {
  subscription: 'bg-blue-900 text-blue-300',
  wallet:       'bg-purple-900 text-purple-300',
  usage:        'bg-yellow-900 text-yellow-300',
  free:         'bg-gray-800 text-gray-400',
};

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function ToolsClient({ tools }: { tools: ToolWithBilling[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBilling, setFilterBilling] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))] as string[];

  const preFiltered = tools.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterBilling && t.billing_type !== filterBilling) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const searchFn = useCallback((t: ToolWithBilling, q: string) =>
    !!(t.name?.toLowerCase().includes(q) || t.vendor?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || t.owner?.toLowerCase().includes(q)),
  []);

  const { search, setSearch, page, setPage, totalPages, totalFiltered, paginated } = useTableControls(preFiltered, searchFn);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Tools</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">{tools.length} registered tools</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Tool
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tools..." />
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterBilling} onChange={e => setFilterBilling(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Billing</option>
            <option value="subscription">Subscription</option>
            <option value="wallet">Wallet</option>
            <option value="usage">Usage</option>
            <option value="free">Free</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deprecated">Deprecated</option>
          </select>
          {(filterCategory || filterBilling || filterStatus) && (
            <button onClick={() => { setFilterCategory(''); setFilterBilling(''); setFilterStatus(''); }}
              className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Clear</button>
          )}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center text-gray-500">No tools found</div>
        ) : paginated.map(tool => {
          const sub = tool.billing_subscriptions?.[0];
          return (
            <Link key={tool.id} href={`/tools/${tool.id}`} className="block bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {tool.critical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                  <span className="font-medium text-white text-sm">{tool.name}</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[tool.status]}`}>{tool.status}</span>
              </div>
              {tool.vendor && <p className="text-xs text-gray-500">{tool.vendor}</p>}
              <CardField label="Category"><span className="text-xs text-gray-300">{tool.category ?? '—'}</span></CardField>
              <CardField label="Billing"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BILLING_BADGE[tool.billing_type]}`}>{tool.billing_type}</span></CardField>
              <CardField label="Risk"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_BADGE[tool.risk_level]}`}>{tool.risk_level}</span></CardField>
              <CardField label="Owner"><span className="text-xs text-gray-400">{tool.owner ?? '—'}</span></CardField>
              <CardField label="Monthly Cost"><span className="text-xs text-gray-300 font-medium">{sub ? `${sub.currency} ${sub.monthly_cost.toFixed(2)}` : '—'}</span></CardField>
            </Link>
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tool</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Billing</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Cost</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500">No tools found</td></tr>
              ) : paginated.map(tool => {
                const sub = tool.billing_subscriptions?.[0];
                return (
                  <tr key={tool.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {tool.critical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Critical" />}
                        <span className="font-medium text-white">{tool.name}</span>
                      </div>
                      {tool.vendor && <p className="text-xs text-gray-500 mt-0.5">{tool.vendor}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-400">{tool.category ?? '—'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BILLING_BADGE[tool.billing_type]}`}>{tool.billing_type}</span></td>
                    <td className="px-5 py-4 text-gray-400">{tool.owner ?? '—'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_BADGE[tool.risk_level]}`}>{tool.risk_level}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[tool.status]}`}>{tool.status}</span></td>
                    <td className="px-5 py-4 text-right text-gray-300">{sub ? `${sub.currency} ${sub.monthly_cost.toFixed(2)}` : '—'}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/tools/${tool.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">View →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {showModal && <AddToolModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
