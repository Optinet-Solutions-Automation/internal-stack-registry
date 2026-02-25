'use client';

import { useState } from 'react';
import type { Purchase } from '@/types/database';
import AddPurchaseModal from './AddPurchaseModal';
import EditPurchaseModal from './EditPurchaseModal';
import { deletePurchase } from './actions';

function daysUntilExpiry(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / 86400000);
}

function WarrantyBadge({ expires }: { expires: string | null }) {
  const days = daysUntilExpiry(expires);
  if (days === null) return <span className="text-gray-500">—</span>;
  if (days < 0) return <span className="text-red-400 text-xs font-medium">Expired</span>;
  if (days <= 90) return <span className="text-yellow-400 text-xs font-medium">{days}d left</span>;
  return <span className="text-green-400 text-xs font-medium">{new Date(expires!).toLocaleDateString()}</span>;
}

export default function PurchasesClient({ purchases }: { purchases: Purchase[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [...new Set(purchases.map(p => p.category).filter(Boolean))] as string[];
  const filtered = purchases.filter(p => !filterCategory || p.category === filterCategory);

  const total = purchases.reduce((s, p) => s + Number(p.amount), 0);
  const expiredWarranties = purchases.filter(p => daysUntilExpiry(p.warranty_expires) !== null && daysUntilExpiry(p.warranty_expires)! < 0).length;

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await deletePurchase(id);
    setDeleteConfirm(null);
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchases</h1>
          <p className="mt-1 text-sm text-gray-400">{purchases.length} one-time purchases recorded</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Purchase
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Spent</p>
          <p className="mt-1.5 text-xl font-bold text-white">USD {total.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Expired Warranties</p>
          <p className={`mt-1.5 text-xl font-bold ${expiredWarranties > 0 ? 'text-red-400' : 'text-white'}`}>{expiredWarranties}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Items</p>
          <p className="mt-1.5 text-xl font-bold text-white">{purchases.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')} className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Item', 'Date', 'Amount', 'Vendor', 'Assigned To', 'Warranty ID', 'Warranty Exp.', 'Receipts', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-500">No purchases found</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{p.name}</p>
                    {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                    {p.description && <p className="text-xs text-gray-600 mt-0.5 max-w-xs truncate">{p.description}</p>}
                  </td>
                  <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                    {new Date(p.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 font-semibold text-white whitespace-nowrap">
                    {p.currency} {Number(p.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-gray-400">{p.vendor ?? '—'}</td>
                  <td className="px-4 py-4 text-gray-400">{p.assigned_to ?? '—'}</td>
                  <td className="px-4 py-4 text-gray-400 font-mono text-xs">{p.warranty_id ?? '—'}</td>
                  <td className="px-4 py-4"><WarrantyBadge expires={p.warranty_expires} /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {p.receipt_url && (
                        <button onClick={() => setLightbox(p.receipt_url!)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors">
                          Receipt
                        </button>
                      )}
                      {p.warranty_receipt_url && (
                        <button onClick={() => setLightbox(p.warranty_receipt_url!)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors">
                          Warranty
                        </button>
                      )}
                      {!p.receipt_url && !p.warranty_receipt_url && <span className="text-gray-600 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <button onClick={() => setEditPurchase(p)}
                        className="text-xs text-gray-400 hover:text-white transition-colors">
                        Edit
                      </button>
                      {deleteConfirm === p.id ? (
                        <span className="flex items-center gap-1.5">
                          <button onClick={() => handleDelete(p.id)} disabled={deleting}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
                            {deleting ? '...' : 'Confirm'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="text-xs text-gray-500 hover:text-white transition-colors">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl max-h-[90vh] mx-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300">×</button>
            <img src={lightbox} alt="Receipt" className="rounded-lg max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {showModal && <AddPurchaseModal onClose={() => setShowModal(false)} />}
      {editPurchase && <EditPurchaseModal purchase={editPurchase} onClose={() => setEditPurchase(null)} />}
    </div>
  );
}
