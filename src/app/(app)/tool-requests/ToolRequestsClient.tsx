'use client';

import { useState, useCallback } from 'react';
import type { ToolRequest, ToolRequestStatus } from '@/types/database';
import RequestToolModal from './RequestToolModal';
import ReviewModal from './ReviewModal';
import { deleteToolRequest } from './actions';
import { SearchInput, Pagination, useTableControls } from '@/components/TableControls';

const STATUS_BADGE: Record<ToolRequestStatus, string> = {
  pending:  'bg-yellow-900 text-yellow-300',
  approved: 'bg-green-900 text-green-300',
  rejected: 'bg-red-900 text-red-300',
};

function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function ToolRequestsClient({ requests }: { requests: ToolRequest[] }) {
  const [showRequest, setShowRequest] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ request: ToolRequest; action: 'approved' | 'rejected' } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const preFiltered = filterStatus
    ? requests.filter(r => r.status === filterStatus)
    : requests;

  const searchFn = useCallback((r: ToolRequest, q: string) =>
    !!(r.tool_name?.toLowerCase().includes(q) ||
       r.category?.toLowerCase().includes(q) ||
       r.vendor?.toLowerCase().includes(q) ||
       r.requested_by?.toLowerCase().includes(q)),
  []);

  const { search, setSearch, page, setPage, totalPages, totalFiltered, paginated } =
    useTableControls(preFiltered, searchFn);

  const pending = requests.filter(r => r.status === 'pending').length;

  const handleDelete = async (id: string) => {
    setDeleting(true);
    await deleteToolRequest(id);
    setDeleting(false);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Tool Requests</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            {requests.length} total · {pending} pending review
          </p>
        </div>
        <button onClick={() => setShowRequest(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Request a Tool
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-10 text-center text-gray-500">No requests found</div>
        ) : paginated.map(req => {
          const isConfirming = confirmDeleteId === req.id;
          return (
            <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white text-sm">{req.tool_name}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[req.status]}`}>{req.status}</span>
              </div>
              <CardField label="Category"><span className="text-xs text-gray-300">{req.category ?? '—'}</span></CardField>
              <CardField label="Vendor"><span className="text-xs text-gray-400">{req.vendor ?? '—'}</span></CardField>
              <CardField label="Requested By"><span className="text-xs text-gray-300">{req.requested_by}</span></CardField>
              <CardField label="Date"><span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span></CardField>
              {req.justification && (
                <p className="text-xs text-gray-500 pt-1 border-t border-gray-800 mt-2">{req.justification}</p>
              )}
              {req.review_notes && (
                <p className="text-xs text-gray-500 italic">Review: {req.review_notes}</p>
              )}
              {req.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800 mt-2">
                  <button onClick={() => setReviewTarget({ request: req, action: 'approved' })}
                    className="flex-1 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 border border-green-900 hover:border-green-700 rounded-lg transition-colors">
                    Approve
                  </button>
                  <button onClick={() => setReviewTarget({ request: req, action: 'rejected' })}
                    className="flex-1 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 rounded-lg transition-colors">
                    Reject
                  </button>
                </div>
              )}
              <div className="flex items-center justify-end pt-1">
                {isConfirming ? (
                  <>
                    <span className="text-xs text-gray-400 mr-2">Delete?</span>
                    <button onClick={() => handleDelete(req.id)} disabled={deleting}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50 mr-2">Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-gray-400 hover:text-white transition-colors">No</button>
                  </>
                ) : (
                  <button onClick={() => setConfirmDeleteId(req.id)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800">Delete</button>
                )}
              </div>
            </div>
          );
        })}
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tool</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-500">No requests found</td></tr>
              ) : paginated.map(req => {
                const isConfirming = confirmDeleteId === req.id;
                return (
                  <tr key={req.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{req.tool_name}</p>
                      {req.justification && (
                        <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{req.justification}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400">{req.category ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-400">{req.vendor ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-300">{req.requested_by}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[req.status]}`}>
                        {req.status}
                      </span>
                      {req.review_notes && (
                        <p className="text-xs text-gray-500 mt-0.5 max-w-[160px] truncate" title={req.review_notes}>
                          {req.review_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => setReviewTarget({ request: req, action: 'approved' })}
                              className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors">Approve</button>
                            <button onClick={() => setReviewTarget({ request: req, action: 'rejected' })}
                              className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Reject</button>
                          </>
                        )}
                        {isConfirming ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">Sure?</span>
                            <button onClick={() => handleDelete(req.id)} disabled={deleting}
                              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50">Yes</button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-400 hover:text-white transition-colors">No</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(req.id)}
                            className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalFiltered={totalFiltered} onPageChange={setPage} />
      </div>

      {showRequest && <RequestToolModal onClose={() => setShowRequest(false)} />}
      {reviewTarget && (
        <ReviewModal
          request={reviewTarget.request}
          action={reviewTarget.action}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
