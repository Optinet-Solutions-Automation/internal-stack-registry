'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tool, BillingType, RiskLevel, ToolStatus } from '@/types/database';
import AddToolModal from './AddToolModal';

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

export default function ToolsClient({ tools }: { tools: ToolWithBilling[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBilling, setFilterBilling] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const categories = [...new Set(tools.map(t => t.category).filter(Boolean))] as string[];

  const filtered = tools.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterBilling && t.billing_type !== filterBilling) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tools</h1>
          <p className="mt-1 text-sm text-gray-400">{tools.length} registered tools</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Tool
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterBilling}
          onChange={e => setFilterBilling(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Billing Types</option>
          <option value="subscription">Subscription</option>
          <option value="wallet">Wallet</option>
          <option value="usage">Usage</option>
          <option value="free">Free</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deprecated">Deprecated</option>
        </select>

        {(filterCategory || filterBilling || filterStatus) && (
          <button
            onClick={() => { setFilterCategory(''); setFilterBilling(''); setFilterStatus(''); }}
            className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-500">No tools found</td>
              </tr>
            ) : (
              filtered.map(tool => {
                const sub = tool.billing_subscriptions?.[0];
                return (
                  <tr key={tool.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {tool.critical && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Critical" />
                        )}
                        <span className="font-medium text-white">{tool.name}</span>
                      </div>
                      {tool.vendor && <p className="text-xs text-gray-500 mt-0.5">{tool.vendor}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-400">{tool.category ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BILLING_BADGE[tool.billing_type]}`}>
                        {tool.billing_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{tool.owner ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RISK_BADGE[tool.risk_level]}`}>
                        {tool.risk_level}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[tool.status]}`}>
                        {tool.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-300">
                      {sub ? `${sub.currency} ${sub.monthly_cost.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/tools/${tool.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddToolModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
