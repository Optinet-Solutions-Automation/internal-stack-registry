'use client';

import { useState } from 'react';
import { reviewToolRequest } from './actions';
import type { ToolRequest } from '@/types/database';

export default function ReviewModal({
  request,
  action,
  onClose,
}: {
  request: ToolRequest;
  action: 'approved' | 'rejected';
  onClose: () => void;
}) {
  const [reviewedBy, setReviewedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApproving = action === 'approved';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await reviewToolRequest(request.id, action, reviewedBy, notes);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {isApproving ? 'Approve Request' : 'Reject Request'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{request.tool_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 space-y-1">
            <p className="text-xs text-gray-500">Requested by</p>
            <p className="text-sm text-gray-200">{request.requested_by}</p>
            {request.justification && (
              <>
                <p className="text-xs text-gray-500 pt-1">Justification</p>
                <p className="text-sm text-gray-300">{request.justification}</p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400">Reviewed By</label>
            <input type="text" value={reviewedBy} onChange={e => setReviewedBy(e.target.value)}
              placeholder="Your name" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-400">
              {isApproving ? 'Notes (optional)' : 'Reason for rejection'}
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} placeholder={isApproving ? 'Any notes for the team...' : 'Why is this request being rejected?'}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 text-white ${
                isApproving
                  ? 'bg-green-700 hover:bg-green-600'
                  : 'bg-red-700 hover:bg-red-600'
              }`}>
              {loading ? 'Saving...' : isApproving ? 'Approve' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600';
