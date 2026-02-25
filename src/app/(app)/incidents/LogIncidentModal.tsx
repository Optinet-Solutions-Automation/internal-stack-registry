'use client';

import { useState } from 'react';
import { logIncident, type LogIncidentInput } from './actions';
import type { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/database';

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

const today = new Date().toISOString().slice(0, 16);

const DEFAULTS: LogIncidentInput = {
  tool_id: '',
  type: 'outage',
  severity: 'medium',
  description: '',
  root_cause: '',
  financial_impact: null,
  resolution_steps: '',
  preventive_measures: '',
  status: 'open',
  occurred_at: today,
};

export default function LogIncidentModal({ tools, onClose }: { tools: ToolOption[]; onClose: () => void }) {
  const [form, setForm] = useState<LogIncidentInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof LogIncidentInput, value: string | number | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tool_id) return;
    setLoading(true);
    setError(null);
    const result = await logIncident(form);
    setLoading(false);
    if (result.error) { setError(result.error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Log Incident</h2>
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

          <div className="grid grid-cols-3 gap-4">
            <Field label="Type">
              <select value={form.type} onChange={e => set('type', e.target.value as IncidentType)} className={inputCls}>
                <option value="outage">Outage</option>
                <option value="cost_spike">Cost Spike</option>
                <option value="security">Security</option>
              </select>
            </Field>
            <Field label="Severity">
              <select value={form.severity} onChange={e => set('severity', e.target.value as IncidentSeverity)} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value as IncidentStatus)} className={inputCls}>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Occurred At">
              <input type="datetime-local" value={form.occurred_at} onChange={e => set('occurred_at', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Financial Impact (USD)">
              <input
                type="number" step="0.01" min="0"
                value={form.financial_impact ?? ''}
                onChange={e => set('financial_impact', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.00"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={2} placeholder="What happened?" className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Root Cause">
            <textarea value={form.root_cause} onChange={e => set('root_cause', e.target.value)}
              rows={2} placeholder="Why did it happen?" className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Resolution Steps">
            <textarea value={form.resolution_steps} onChange={e => set('resolution_steps', e.target.value)}
              rows={2} placeholder="How was it resolved?" className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Preventive Measures">
            <textarea value={form.preventive_measures} onChange={e => set('preventive_measures', e.target.value)}
              rows={2} placeholder="How to prevent recurrence?" className={`${inputCls} resize-none`} />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Saving...' : 'Log Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
