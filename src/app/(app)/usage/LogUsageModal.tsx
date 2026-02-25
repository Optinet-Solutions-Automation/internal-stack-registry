'use client';

import { useState } from 'react';
import { logUsage, type LogUsageInput } from './actions';

type ToolOption = { id: string; name: string };

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  );
}

// Default to first of current month
const currentMonth = new Date();
const defaultMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-01`;

export default function LogUsageModal({ tools, onClose }: { tools: ToolOption[]; onClose: () => void }) {
  const [form, setForm] = useState<LogUsageInput>({
    tool_id: '',
    month: defaultMonth,
    usage_amount: 0,
    currency: 'USD',
    budget_limit: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof LogUsageInput, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tool_id) return;
    setLoading(true);
    setError(null);
    const result = await logUsage(form);
    setLoading(false);
    if (result.error) { setError(result.error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Log Usage</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <Field label="Tool *">
            <select value={form.tool_id} onChange={e => set('tool_id', e.target.value)} required className={inputCls}>
              <option value="">Select a tool...</option>
              {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>

          <Field label="Month *">
            <input
              type="month"
              value={form.month.slice(0, 7)}
              onChange={e => set('month', `${e.target.value}-01`)}
              required
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Usage Amount *">
              <input
                type="number" step="0.0001" min="0" required
                value={form.usage_amount}
                onChange={e => set('usage_amount', parseFloat(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls}>
                <option value="USD">USD</option>
                <option value="PHP">PHP</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
          </div>

          <Field label="Budget Limit">
            <input
              type="number" step="0.01" min="0"
              value={form.budget_limit ?? ''}
              onChange={e => set('budget_limit', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="Optional"
              className={inputCls}
            />
          </Field>

          <p className="text-xs text-gray-500">If an entry already exists for this tool + month, it will be updated.</p>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Saving...' : 'Log Usage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
