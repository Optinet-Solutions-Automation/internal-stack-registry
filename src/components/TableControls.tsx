'use client';

import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 10;

export function useTableControls<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const searched = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => searchFn(item, q));
  }, [items, search, searchFn]);

  const totalPages = Math.max(1, Math.ceil(searched.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(page, totalPages);
  const paginated = searched.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  return {
    search,
    setSearch: handleSearch,
    page: safeCurrentPage,
    setPage,
    totalPages,
    totalFiltered: searched.length,
    paginated,
  };
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-gray-600"
      />
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  totalFiltered,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalFiltered: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(page * ITEMS_PER_PAGE, totalFiltered);

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-gray-500">
        {start}–{end} of {totalFiltered}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed rounded transition-colors"
        >
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="px-1 text-gray-600 text-xs">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`px-2.5 py-1.5 text-xs rounded transition-colors ${
                  p === page
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ),
          )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed rounded transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
