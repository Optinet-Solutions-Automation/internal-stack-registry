'use client';

import { useState } from 'react';
import { createToolRequest, type CreateToolRequestInput } from './actions';

const DEFAULTS: CreateToolRequestInput = {
  tool_name: '',
  category: '',
  vendor: '',
  justification: '',
  requested_by: '',
};

export default function RequestToolModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateToolRequestInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateToolRequestInput, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tool_name.trim() || !form.requested_by.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createToolRequest(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Request a Tool</h2>
            <p className="text-xs text-gray-500 mt-0.5">Submit a request for a new tool to be evaluated</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <Field label="Tool Name *">
            <input type="text" value={form.tool_name} onChange={e => set('tool_name', e.target.value)}
              required placeholder="e.g. Notion" className={inputCls} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <input type="text" value={form.category} onChange={e => set('category', e.target.value)}
                placeholder="e.g. Productivity" className={inputCls} />
            </Field>
            <Field label="Vendor">
              <input type="text" value={form.vendor} onChange={e => set('vendor', e.target.value)}
                placeholder="e.g. Notion Labs" className={inputCls} />
            </Field>
          </div>

          <Field label="Requested By *">
            <input type="text" value={form.requested_by} onChange={e => set('requested_by', e.target.value)}
              required placeholder="Your name or team" className={inputCls} />
          </Field>

          <Field label="Justification">
            <textarea value={form.justification} onChange={e => set('justification', e.target.value)}
              rows={4} placeholder="Why do we need this tool? What problem does it solve?"
              className={`${inputCls} resize-none`} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Submitting...' : 'Submit Request'}
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
