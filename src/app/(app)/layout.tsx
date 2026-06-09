import Sidebar from '@/components/layout/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Auth is enforced by middleware — no Supabase session check needed here
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-[72px] lg:pt-0 px-4 py-6 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
