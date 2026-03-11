'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',    icon: '▦' },
  { href: '/tools',       label: 'Tools',         icon: '⚙' },
  { href: '/projects',    label: 'Projects',      icon: '◫' },
  { href: '/billing',     label: 'Billing',       icon: '◈' },
  { href: '/wallets',     label: 'Wallets',       icon: '◉' },
  { href: '/usage',       label: 'Usage',         icon: '◎' },
  { href: '/credentials', label: 'Credentials',   icon: '◬' },
  { href: '/incidents',   label: 'Incidents',     icon: '◭' },
  { href: '/alerts',      label: 'Alerts',        icon: '◆' },
  { href: '/purchases',   label: 'Purchases',     icon: '◻' },
  { href: '/settings',    label: 'Settings',      icon: '◌' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Optinet</p>
          <p className="text-sm font-bold text-white -mt-0.5">Stack Registry</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-56 shrink-0 flex flex-col h-screen bg-gray-900 border-r border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        pt-[60px] lg:pt-0
      `}>
        {/* Logo — desktop only */}
        <div className="hidden lg:block px-5 py-5 border-b border-gray-800">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Optinet</p>
          <p className="text-sm font-bold text-white mt-0.5">Stack Registry</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <span>→</span> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
