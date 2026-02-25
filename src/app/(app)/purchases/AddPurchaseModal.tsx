'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createPurchase, type CreatePurchaseInput } from './actions';

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      {children}
    </div>
  );
}

// Compress image to max 1200px, JPEG 75% — keeps files under ~300KB
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', 0.75);
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function uploadReceipt(file: File, folder: string): Promise<string | null> {
  const supabase = createClient();
  const compressed = await compressImage(file);
  const ext = 'jpg';
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('receipts').upload(path, compressed, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('receipts').getPublicUrl(path);
  return data.publicUrl;
}

type Form = Omit<CreatePurchaseInput, 'receipt_url' | 'warranty_receipt_url'>;

const today = new Date().toISOString().slice(0, 10);

const DEFAULTS: Form = {
  name: '', purchase_date: today, amount: 0, currency: 'USD',
  description: '', vendor: '', category: '', assigned_to: '',
  warranty_id: '', warranty_expires: '',
};

export default function AddPurchaseModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLInputElement>(null);
  const warrantyRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof Form, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.purchase_date) return;
    setLoading(true);
    setError(null);

    try {
      let receipt_url: string | null = null;
      let warranty_receipt_url: string | null = null;

      if (receiptFile) receipt_url = await uploadReceipt(receiptFile, 'receipts');
      if (warrantyFile) warranty_receipt_url = await uploadReceipt(warrantyFile, 'warranty');

      const result = await createPurchase({ ...form, receipt_url, warranty_receipt_url });
      if (result.error) { setError(result.error); return; }
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Add Purchase</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <Field label="Item Name *">
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. MacBook Pro 14" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Purchase Date *">
              <input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} required className={inputCls} />
            </Field>
            <Field label="Category">
              <input type="text" value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Hardware" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount *">
              <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} className={inputCls} />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls}>
                <option value="USD">USD</option>
                <option value="PHP">PHP</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Vendor">
              <input type="text" value={form.vendor ?? ''} onChange={e => set('vendor', e.target.value)} placeholder="e.g. Apple" className={inputCls} />
            </Field>
            <Field label="Assigned To">
              <input type="text" value={form.assigned_to ?? ''} onChange={e => set('assigned_to', e.target.value)} placeholder="e.g. Chris" className={inputCls} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Additional notes" className={`${inputCls} resize-none`} />
          </Field>

          {/* Warranty */}
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Warranty</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Warranty ID">
                <input type="text" value={form.warranty_id ?? ''} onChange={e => set('warranty_id', e.target.value)} placeholder="e.g. WR-123456" className={inputCls} />
              </Field>
              <Field label="Warranty Expires">
                <input type="date" value={form.warranty_expires ?? ''} onChange={e => set('warranty_expires', e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>

          {/* Receipts */}
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipts — images compressed automatically</p>

            <Field label="Purchase Receipt (photo/scan)">
              <div
                onClick={() => receiptRef.current?.click()}
                className="border border-dashed border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-indigo-500 transition-colors text-center"
              >
                {receiptFile ? (
                  <p className="text-sm text-indigo-300">{receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)</p>
                ) : (
                  <p className="text-sm text-gray-500">Click to upload receipt image</p>
                )}
                <input
                  ref={receiptRef} type="file" accept="image/*" className="hidden"
                  onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </Field>

            <Field label="Warranty Receipt (photo/scan)">
              <div
                onClick={() => warrantyRef.current?.click()}
                className="border border-dashed border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-indigo-500 transition-colors text-center"
              >
                {warrantyFile ? (
                  <p className="text-sm text-indigo-300">{warrantyFile.name} ({(warrantyFile.size / 1024).toFixed(0)} KB)</p>
                ) : (
                  <p className="text-sm text-gray-500">Click to upload warranty image</p>
                )}
                <input
                  ref={warrantyRef} type="file" accept="image/*" className="hidden"
                  onChange={e => setWarrantyFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Uploading...' : 'Add Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
