'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addTopUp, updateThreshold } from '../actions';
import type { Wallet, TopupTransaction } from '@/types/database';

type WalletWithTool = Wallet & {
  tools: { id: string; name: string; category: string | null } | null;
};

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function WalletDetailClient({
  wallet,
  topups,
  burnRate,
  runway,
}: {
  wallet: WalletWithTool;
  topups: TopupTransaction[];
  burnRate: number | null;
  runway: number | null;
}) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpCurrency, setTopUpCurrency] = useState(wallet.currency);
  const [topUpBy, setTopUpBy] = useState('');
  const [topUpNotes, setTopUpNotes] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const [threshold, setThreshold] = useState(String(wallet.low_threshold));
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  const isLow = Number(wallet.current_balance) <= Number(wallet.low_threshold);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) return;
    setTopUpLoading(true);
    setTopUpError(null);
    const result = await addTopUp(wallet.id, {
      amount,
      currency: topUpCurrency,
      topped_up_by: topUpBy,
      notes: topUpNotes,
    });
    setTopUpLoading(false);
    if (result.error) {
      setTopUpError(result.error);
    } else {
      setShowTopUp(false);
      setTopUpAmount('');
      setTopUpBy('');
      setTopUpNotes('');
    }
  };

  const handleThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    setThresholdLoading(true);
    await updateThreshold(wallet.id, parseFloat(threshold) || 0);
    setThresholdLoading(false);
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div>
        <Link href="/wallets" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Wallets
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">
            {wallet.tools?.name ?? 'Wallet'} — Wallet
          </h1>
          {isLow && (
            <span className="bg-red-900 text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full">Low Balance</span>
          )}
        </div>
        {wallet.tools?.category && (
          <p className="mt-1 text-sm text-gray-400">{wallet.tools.category}</p>
        )}
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Current Balance',
            value: `${wallet.currency} ${Number(wallet.current_balance).toFixed(2)}`,
            highlight: isLow ? 'text-red-400' : 'text-white',
          },
          {
            label: 'Low Threshold',
            value: `${wallet.currency} ${Number(wallet.low_threshold).toFixed(2)}`,
            highlight: 'text-white',
          },
          {
            label: 'Avg Burn Rate',
            value: burnRate !== null ? `${wallet.currency} ${burnRate.toFixed(2)}/mo` : '—',
            highlight: 'text-white',
          },
          {
            label: 'Est. Runway',
            value: runway !== null ? `${runway.toFixed(1)} months` : '—',
            highlight: runway !== null && runway < 2 ? 'text-red-400' : 'text-white',
          },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className={`mt-1.5 text-lg font-bold ${card.highlight}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-up */}
        <Section title="Add Top-Up">
          {!showTopUp ? (
            <button
              onClick={() => setShowTopUp(true)}
              className="w-full py-2.5 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-indigo-500 transition-colors"
            >
              + Add Top-Up
            </button>
          ) : (
            <form onSubmit={handleTopUp} className="space-y-3">
              {topUpError && (
                <div className="bg-red-900/40 border border-red-800 text-red-300 text-xs rounded-lg px-3 py-2">
                  {topUpError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Amount *</label>
                  <input
                    type="number" step="0.01" min="0.01" required
                    value={topUpAmount}
                    onChange={e => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Currency</label>
                  <select value={topUpCurrency} onChange={e => setTopUpCurrency(e.target.value)} className={inputCls}>
                    <option value="USD">USD</option>
                    <option value="PHP">PHP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Topped Up By</label>
                <input type="text" value={topUpBy} onChange={e => setTopUpBy(e.target.value)} placeholder="e.g. Finance" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Notes</label>
                <input type="text" value={topUpNotes} onChange={e => setTopUpNotes(e.target.value)} placeholder="Optional note" className={inputCls} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowTopUp(false)} className="flex-1 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={topUpLoading} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {topUpLoading ? 'Saving...' : 'Confirm Top-Up'}
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* Threshold */}
        <Section title="Threshold Settings">
          <form onSubmit={handleThreshold} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Low Balance Threshold ({wallet.currency})</label>
              <input
                type="number" step="0.01" min="0"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className={inputCls}
              />
            </div>
            <p className="text-xs text-gray-500">An alert will trigger when the balance drops below this amount.</p>
            <button
              type="submit"
              disabled={thresholdLoading}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {thresholdSaved ? '✓ Saved' : thresholdLoading ? 'Saving...' : 'Update Threshold'}
            </button>
          </form>
        </Section>
      </div>

      {/* Top-up history */}
      <Section title="Top-Up History">
        {topups.length === 0 ? (
          <p className="text-sm text-gray-500">No top-ups recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Amount', 'By', 'Notes', 'Date'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {topups.map(t => (
                <tr key={t.id}>
                  <td className="py-3 pr-4 font-semibold text-green-400">
                    + {t.currency} {Number(t.amount).toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{t.topped_up_by ?? '—'}</td>
                  <td className="py-3 pr-4 text-gray-400">{t.notes ?? '—'}</td>
                  <td className="py-3 text-gray-500 text-xs">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}
