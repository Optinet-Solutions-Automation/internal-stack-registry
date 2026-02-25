'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BillingSubscription } from '@/types/database';
import AddSubscriptionModal from './AddSubscriptionModal';

type SubWithTool = BillingSubscription & {
  tools: { id: string; name: string; category: string | null } | null;
};

type ToolOption = { id: string; name: string };

const FREQ_CLS: Record<string, string> = {
  monthly:   'bg-blue-900 text-blue-300',
  quarterly: 'bg-purple-900 text-purple-300',
  annual:    'bg-indigo-900 text-indigo-300',
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function RenewalBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-gray-500">—</span>;
  const days = daysUntil(date);
  const label = new Date(date).toLocaleDateString();
  if (days < 0)  return <span className="text-red-400 font-medium">{label} (overdue)</span>;
  if (days <= 14) return <span className="text-red-400 font-medium">{label} ({days}d)</span>;
  if (days <= 30) return <span className="text-yellow-400 font-medium">{label} ({days}d)</span>;
  return <span className="text-gray-300">{label}</span>;
}

export default function BillingClient({
  subscriptions,
  tools,
}: {
  subscriptions: SubWithTool[];
  tools: ToolOption[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [filterFreq, setFilterFreq] = useState('');

  const filtered = subscriptions.filter(s => !filterFreq || s.payment_frequency === filterFreq);

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.payment_frequency === 'monthly') return sum + Number(s.monthly_cost);
    if (s.payment_frequency === 'quarterly') return sum + Number(s.monthly_cost);
    if (s.payment_frequency === 'annual') return sum + Number(s.monthly_cost);
    return sum + Number(s.monthly_cost);
  }, 0);

  const renewingSoon = subscriptions.filter(s => {
    if (!s.renewal_date) return false;
    const d = daysUntil(s.renewal_date);
    return d >= 0 && d <= 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="mt-1 text-sm text-gray-400">{subscriptions.length} subscriptions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Subscription
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total / Month</p>
          <p className="mt-1.5 text-xl font-bold text-white">USD {totalMonthly.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Renewing in 30 days</p>
          <p className={`mt-1.5 text-xl font-bold ${renewingSoon > 0 ? 'text-yellow-400' : 'text-white'}`}>
            {renewingSoon}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
          <p className="mt-1.5 text-xl font-bold text-white">{subscriptions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterFreq}
          onChange={e => setFilterFreq(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Frequencies</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
        </select>
        {filterFreq && (
          <button
            onClick={() => setFilterFreq('')}
            className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Tool', 'Plan', 'Monthly Cost', 'Frequency', 'Renewal Date', 'Billing Owner'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">No subscriptions found</td>
              </tr>
            ) : (
              filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    {sub.tools ? (
                      <div>
                        <Link href={`/tools/${sub.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300">
                          {sub.tools.name}
                        </Link>
                        {sub.tools.category && (
                          <p className="text-xs text-gray-500 mt-0.5">{sub.tools.category}</p>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-300">{sub.plan_name ?? '—'}</td>
                  <td className="px-5 py-4 font-medium text-white">
                    {sub.currency} {Number(sub.monthly_cost).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${FREQ_CLS[sub.payment_frequency]}`}>
                      {sub.payment_frequency}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RenewalBadge date={sub.renewal_date} />
                  </td>
                  <td className="px-5 py-4 text-gray-400">{sub.billing_owner ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddSubscriptionModal tools={tools} onClose={() => setShowModal(false)} />}
    </div>
  );
}
