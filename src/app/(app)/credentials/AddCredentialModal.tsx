'use client';

import { useState } from 'react';
import { createCredential, type CreateCredentialInput } from './actions';

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

const LOGIN_TYPES = ['SSO', 'API Key', 'Username / Password', 'OAuth', 'Service Account', 'MFA Token'];

const DEFAULTS: CreateCredentialInput = {
  tool_id: '',
  login_type: '',
  credential_location: '',
  username: '',
  password: '',
  last_rotated: '',
  rotation_policy: '',
  owner: '',
  compliance_notes: '',
};

export default function AddCredentialModal({
  tools,
  onClose,
}: {
  tools: ToolOption[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateCredentialInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof CreateCredentialInput, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tool_id) return;
    setLoading(true);
    setError(null);
    const result = await createCredential(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-t-xl sm:rounded-xl w-full sm:max-w-md sm:mx-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add Credential Reference</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-3 bg-gray-800/50 border-b border-gray-800">
          <p className="text-xs text-gray-400">
            ⚠ Never enter raw passwords. Store only references to where credentials are kept (e.g. vault paths, 1Password entries).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Field label="Tool *">
            <select value={form.tool_id} onChange={e => set('tool_id', e.target.value)} required className={inputCls}>
              <option value="">Select a tool...</option>
              {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Login Type">
              <select value={form.login_type} onChange={e => set('login_type', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {LOGIN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Owner">
              <input type="text" value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="e.g. DevOps" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Username">
              <input type="text" value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. admin@company.com" className={inputCls} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </Field>
          </div>

          <Field label="Credential Location">
            <input
              type="text"
              value={form.credential_location}
              onChange={e => set('credential_location', e.target.value)}
              placeholder="e.g. 1Password > Vercel API Keys"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Last Rotated">
              <input type="date" value={form.last_rotated} onChange={e => set('last_rotated', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Rotation Policy">
              <input type="text" value={form.rotation_policy} onChange={e => set('rotation_policy', e.target.value)} placeholder="e.g. Every 90 days" className={inputCls} />
            </Field>
          </div>

          <Field label="Compliance Notes">
            <textarea
              value={form.compliance_notes}
              onChange={e => set('compliance_notes', e.target.value)}
              rows={2}
              placeholder="Optional compliance or access notes"
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Add Reference'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
