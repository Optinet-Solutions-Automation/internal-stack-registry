'use client';

import { useState } from 'react';
import { createTool, type CreateToolInput } from './actions';
import type { BillingType, RiskLevel, ToolStatus } from '@/types/database';

const DEFAULTS: CreateToolInput = {
  name: '',
  category: '',
  billing_type: 'subscription',
  vendor: '',
  owner: '',
  environment: 'production',
  critical: false,
  risk_level: 'low',
  status: 'active',
  description: '',
};

export default function AddToolModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateToolInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateToolInput, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createTool(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add Tool</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Field label="Tool Name *">
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="e.g. Stripe"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input
                type="text"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Payments"
                className={inputCls}
              />
            </Field>
            <Field label="Vendor">
              <input
                type="text"
                value={form.vendor}
                onChange={e => set('vendor', e.target.value)}
                placeholder="e.g. Stripe Inc."
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner">
              <input
                type="text"
                value={form.owner}
                onChange={e => set('owner', e.target.value)}
                placeholder="e.g. Finance"
                className={inputCls}
              />
            </Field>
            <Field label="Environment">
              <input
                type="text"
                value={form.environment}
                onChange={e => set('environment', e.target.value)}
                placeholder="e.g. production"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Billing Type">
              <select
                value={form.billing_type}
                onChange={e => set('billing_type', e.target.value as BillingType)}
                className={inputCls}
              >
                <option value="subscription">Subscription</option>
                <option value="wallet">Wallet</option>
                <option value="usage">Usage</option>
                <option value="free">Free</option>
              </select>
            </Field>
            <Field label="Risk Level">
              <select
                value={form.risk_level}
                onChange={e => set('risk_level', e.target.value as RiskLevel)}
                className={inputCls}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as ToolStatus)}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </Field>
            <Field label="Critical">
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.critical}
                    onChange={e => set('critical', e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm text-gray-300">Mark as critical</span>
                </label>
              </div>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="What does this tool do?"
              className={`${inputCls} resize-none`}
            />
          </Field>

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
              {loading ? 'Saving...' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  );
}
