'use client';

import Link from 'next/link';
import type { Wallet } from '@/types/database';

type WalletWithTool = Wallet & {
  tools: { id: string; name: string; category: string | null } | null;
};

export default function WalletsClient({ wallets }: { wallets: WalletWithTool[] }) {
  const lowBalanceWallets = wallets.filter(w => Number(w.current_balance) <= Number(w.low_threshold));
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.current_balance), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Wallets</h1>
        <p className="mt-1 text-sm text-gray-400">{wallets.length} prepaid wallets</p>
      </div>

      {/* Low balance banner */}
      {lowBalanceWallets.length > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <div>
            <p className="text-sm font-semibold text-red-300">
              {lowBalanceWallets.length} wallet{lowBalanceWallets.length > 1 ? 's' : ''} below threshold
            </p>
            <p className="text-xs text-red-400 mt-0.5">
              {lowBalanceWallets.map(w => w.tools?.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Balance</p>
          <p className="mt-1.5 text-xl font-bold text-white">USD {totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Below Threshold</p>
          <p className={`mt-1.5 text-xl font-bold ${lowBalanceWallets.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {lowBalanceWallets.length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Wallets</p>
          <p className="mt-1.5 text-xl font-bold text-white">{wallets.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Tool', 'Current Balance', 'Low Threshold', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {wallets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500">No wallets found</td>
              </tr>
            ) : (
              wallets.map(wallet => {
                const isLow = Number(wallet.current_balance) <= Number(wallet.low_threshold);
                const pct = Number(wallet.low_threshold) > 0
                  ? Math.min((Number(wallet.current_balance) / (Number(wallet.low_threshold) * 5)) * 100, 100)
                  : null;

                return (
                  <tr key={wallet.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      {wallet.tools ? (
                        <div>
                          <Link href={`/tools/${wallet.tools.id}`} className="font-medium text-indigo-400 hover:text-indigo-300">
                            {wallet.tools.name}
                          </Link>
                          {wallet.tools.category && (
                            <p className="text-xs text-gray-500 mt-0.5">{wallet.tools.category}</p>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-semibold ${isLow ? 'text-red-400' : 'text-white'}`}>
                        {wallet.currency} {Number(wallet.current_balance).toFixed(2)}
                      </span>
                      {pct !== null && (
                        <div className="mt-1.5 h-1 w-24 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400">
                      {wallet.currency} {Number(wallet.low_threshold).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      {isLow ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">Low</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">OK</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/wallets/${wallet.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
