'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
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
  );
}
