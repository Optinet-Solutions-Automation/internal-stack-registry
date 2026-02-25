'use client';

import { useState } from 'react';
import { createSubscription, type CreateSubscriptionInput } from './actions';
import type { PaymentFrequency } from '@/types/database';

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

const DEFAULTS: CreateSubscriptionInput = {
  tool_id: '',
  plan_name: '',
  monthly_cost: 0,
  currency: 'USD',
  payment_frequency: 'monthly',
  renewal_date: '',
  billing_owner: '',
};

export default function AddSubscriptionModal({
  tools,
  onClose,
}: {
  tools: ToolOption[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateSubscriptionInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateSubscriptionInput, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tool_id) return;
    setLoading(true);
    setError(null);
    const result = await createSubscription(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add Subscription</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Field label="Tool *">
            <select
              value={form.tool_id}
              onChange={e => set('tool_id', e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Select a tool...</option>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan Name">
              <input
                type="text"
                value={form.plan_name}
                onChange={e => set('plan_name', e.target.value)}
                placeholder="e.g. Pro"
                className={inputCls}
              />
            </Field>
            <Field label="Frequency">
              <select
                value={form.payment_frequency}
                onChange={e => set('payment_frequency', e.target.value as PaymentFrequency)}
                className={inputCls}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Monthly Cost *">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monthly_cost}
                onChange={e => set('monthly_cost', parseFloat(e.target.value) || 0)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className={inputCls}
              >
                <option value="USD">USD — US Dollar</option>
                <option value="PHP">PHP — Philippine Peso</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Renewal Date">
              <input
                type="date"
                value={form.renewal_date}
                onChange={e => set('renewal_date', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Billing Owner">
              <input
                type="text"
                value={form.billing_owner}
                onChange={e => set('billing_owner', e.target.value)}
                placeholder="e.g. Finance"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
